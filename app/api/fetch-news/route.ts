import { NextResponse } from 'next/server';
import { fetchRssFeed } from '@/lib/rss';
import { rewriteNews } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { NEWS_SOURCES } from '@/lib/newsSources';
import { isSimilarStory } from '@/lib/storyClustering';
import { normalizeEditorialCategory } from '@/lib/editorialRules';
import { getEditorialWriteClient } from '@/lib/supabaseServer';
import { reviewEditorialDraft, type EditorialEvidence, type EditorialReviewResult } from '@/lib/editorialReview';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type FeedArticle = {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  imageUrl?: string;
  sourceName?: string;
};

type CandidateEvidence = {
  source: (typeof NEWS_SOURCES)[number];
  article: FeedArticle;
};

type StoryCandidate = {
  items: CandidateEvidence[];
};

type SourceRunStats = {
  id: string;
  name: string;
  feedUrl: string;
  fetched: number;
  fresh: number;
  selected: number;
  staged: number;
  held: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  errors: string[];
};

// Independent gates: none may be opened by changing only the pause switch.
const EDITORIAL_PUBLICATION_PAUSED = true;
const EDITORIAL_REVIEW_GATE_READY = false; // Requires a chosen independent provider, budget cap, tests, and verified queue schema.
const EDITORIAL_QUEUE_SCHEMA_READY = false; // Migration is prepared but not yet applied/verified.
const EDITORIAL_AI_BUDGET_APPROVED = false;
const MAX_SOURCES_PER_RUN = 5;
const MAX_STORIES_PER_RUN = 5;
const STORY_WINDOW_HOURS = 48;
const PROMPT_VERSION = 'editorial-evidence-review-v1';

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

function safeHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function dateOrNull(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function plainText(value: string): string {
  return String(value || '')
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function storyKey(title: string): string {
  return title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180);
}

function heldResult(code: string, summary: string): EditorialReviewResult {
  return {
    decision: 'hold',
    model: 'not_run',
    summary,
    claims: [],
    issues: [{ severity: 'major', code, description: summary }],
  };
}

function mapEvidence(items: CandidateEvidence[]): EditorialEvidence[] {
  const seenGroups = new Set<string>();
  const evidence: EditorialEvidence[] = [];
  for (const item of items) {
    const group = item.source.independenceGroup.trim();
    const excerpt = plainText(item.article.content).slice(0, 6000);
    if (!group || group === 'unreviewed' || seenGroups.has(group) || excerpt.length < 120) continue;
    seenGroups.add(group);
    evidence.push({
      publisher: item.source.name,
      title: item.article.title,
      url: item.article.link,
      excerpt,
      rightsStatus: item.source.rewriteRights,
      independenceGroup: group,
      publishedAt: item.article.pubDate || null,
    });
  }
  return evidence;
}

function buildStoryCandidates(feeds: Array<{ source: (typeof NEWS_SOURCES)[number]; articles: FeedArticle[] }>): StoryCandidate[] {
  const candidates: StoryCandidate[] = [];
  for (const { source, articles } of feeds) {
    for (const article of articles) {
      const match = candidates.find((candidate) =>
        isSimilarStory(article.title, candidate.items.map((item) => item.article.title))
      );
      if (match) {
        if (!match.items.some((item) => item.source.id === source.id)) match.items.push({ source, article });
      } else {
        candidates.push({ items: [{ source, article }] });
      }
    }
  }
  return candidates;
}

export async function GET(request: Request) {
  if (EDITORIAL_PUBLICATION_PAUSED) {
    return NextResponse.json(
      { success: false, paused: true, message: 'La publicación automática continúa pausada.' },
      { status: 503, headers: { 'Retry-After': '604800', 'Cache-Control': 'no-store' } },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  if (!EDITORIAL_REVIEW_GATE_READY || !EDITORIAL_QUEUE_SCHEMA_READY || !EDITORIAL_AI_BUDGET_APPROVED) {
    return NextResponse.json(
      { success: false, paused: true, message: 'Faltan aprobaciones y pruebas del flujo editorial privado.' },
      { status: 503, headers: { 'Retry-After': '604800', 'Cache-Control': 'no-store' } },
    );
  }

  const writeClient = getEditorialWriteClient();
  if (!writeClient) {
    return NextResponse.json(
      { success: false, paused: true, message: 'La credencial de escritura privada no está configurada.' },
      { status: 503, headers: { 'Retry-After': '604800', 'Cache-Control': 'no-store' } },
    );
  }

  const startedAt = new Date();
  const eligibleSources = NEWS_SOURCES.filter((source) =>
    source.enabled &&
    source.feedStatus === 'healthy' &&
    source.rewriteRights === 'approved' &&
    source.independenceGroup !== 'unreviewed'
  ).slice(0, MAX_SOURCES_PER_RUN);

  if (eligibleSources.length < 2) {
    return NextResponse.json(
      { success: false, paused: true, message: 'Se requieren al menos dos fuentes activas con permiso y procedencia verificados.' },
      { status: 503, headers: { 'Retry-After': '604800', 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const cutoff = new Date(Date.now() - STORY_WINDOW_HOURS * 60 * 60 * 1000);
    const { data: recentArticles, error: recentError } = await supabase
      .from('news_articles')
      .select('ai_title, original_title, source_url')
      .gte('published_at', cutoff.toISOString())
      .order('published_at', { ascending: false })
      .limit(500);
    if (recentError) {
      return NextResponse.json(
        { success: false, paused: true, message: 'No se pudo verificar el índice público de duplicados; no se procesaron artículos.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const { data: queuedRows, error: queueReadError } = await writeClient
      .from('editorial_review_queue')
      .select('source_url, story_key, original_title, draft_title')
      .gte('created_at', cutoff.toISOString())
      .limit(1000);
    if (queueReadError) {
      return NextResponse.json(
        { success: false, paused: true, message: 'No se pudo verificar la cola privada; no se procesaron artículos.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const publicRows = recentArticles || [];
    const privateRows = queuedRows || [];
    const knownTitles = [
      ...publicRows.flatMap((row: any) => [row.ai_title, row.original_title]),
      ...privateRows.flatMap((row: any) => [row.original_title, row.draft_title]),
    ].filter(Boolean) as string[];
    const knownUrls = new Set<string>([
      ...publicRows.map((row: any) => row.source_url),
      ...privateRows.map((row: any) => row.source_url),
    ].filter(Boolean));

    const sourceStats: SourceRunStats[] = [];
    const feeds: Array<{ source: (typeof NEWS_SOURCES)[number]; articles: FeedArticle[] }> = [];
    const errors: string[] = [];

    for (const source of eligibleSources) {
      const stats: SourceRunStats = {
        id: source.id, name: source.name, feedUrl: source.url, fetched: 0, fresh: 0,
        selected: 0, staged: 0, held: 0, skippedDuplicates: 0, skippedInvalid: 0, errors: [],
      };
      sourceStats.push(stats);
      try {
        const feedArticles = await fetchRssFeed(source.url) as FeedArticle[];
        stats.fetched = feedArticles.length;
        const fresh = feedArticles.filter((article) => {
          const published = dateOrNull(article.pubDate);
          return Boolean(published && published >= cutoff);
        });
        stats.fresh = fresh.length;
        const usable: FeedArticle[] = [];
        for (const article of fresh) {
          if (!article.title?.trim() || !article.link || !safeHttpsUrl(article.link)) {
            stats.skippedInvalid++;
            continue;
          }
          if (knownUrls.has(article.link) || isSimilarStory(article.title, knownTitles)) {
            stats.skippedDuplicates++;
            continue;
          }
          usable.push(article);
        }
        stats.selected = usable.length;
        feeds.push({ source, articles: usable });
      } catch (error: any) {
        const message = `${source.name}: ${error?.message || 'feed no disponible'}`;
        stats.errors.push(message);
        errors.push(message);
      }
    }

    const candidates = buildStoryCandidates(feeds).slice(0, MAX_STORIES_PER_RUN);
    let stagedCount = 0;
    let heldCount = 0;
    let reviewPendingCount = 0;

    for (const candidate of candidates) {
      const orderedItems = [...candidate.items].sort((a, b) =>
        (dateOrNull(b.article.pubDate)?.getTime() || 0) - (dateOrNull(a.article.pubDate)?.getTime() || 0)
      );
      const primary = orderedItems[0];
      if (!primary) continue;

      const evidence = mapEvidence(orderedItems);
      let draftTitle: string | null = null;
      let draftContent: string | null = null;
      let reviewResult: EditorialReviewResult;
      let queueStatus: 'review_pending' | 'held' | 'rejected' = 'held';
      let lastError: string | null = null;
      let category = normalizeEditorialCategory(primary.source.section, primary.article.title);

      if (evidence.length < 2) {
        reviewResult = heldResult(
          'insufficient_independent_evidence',
          'Se retuvo el candidato: no hay dos evidencias aprobadas y de orígenes independientes.'
        );
        lastError = reviewResult.summary;
      } else if (!process.env.GEMINI_API_KEY || !process.env.EDITORIAL_REVIEW_API_KEY) {
        reviewResult = heldResult('model_credentials_missing', 'Faltan credenciales separadas para redacción y revisión; el candidato quedó retenido.');
        lastError = reviewResult.summary;
      } else {
        const alternatives = orderedItems.slice(1).map((item) => ({
          source: item.source.name,
          title: item.article.title,
          snippet: plainText(item.article.content).slice(0, 6000),
        }));
        const rewritten = await rewriteNews(primary.article.title, primary.article.content, alternatives);
        if (!rewritten || rewritten.error || !rewritten.new_title || !rewritten.new_content) {
          reviewResult = heldResult('writer_failed', 'La redacción no produjo un borrador válido; el candidato quedó retenido.');
          lastError = reviewResult.summary;
        } else {
          draftTitle = String(rewritten.new_title).slice(0, 500);
          draftContent = String(rewritten.new_content).slice(0, 100000);
          category = normalizeEditorialCategory(rewritten.category || primary.source.section, draftTitle);
          reviewResult = await reviewEditorialDraft({
            title: draftTitle,
            htmlContent: draftContent,
            category,
            evidence,
          });
          if (reviewResult.decision === 'approve') {
            queueStatus = 'review_pending'; // AI approval is never publication approval.
          } else if (reviewResult.decision === 'reject') {
            queueStatus = 'rejected';
            lastError = reviewResult.summary;
          } else {
            queueStatus = 'held';
            lastError = reviewResult.summary;
          }
        }
      }

      const evidenceSummary = evidence.map((item) => ({
        publisher: item.publisher,
        title: item.title,
        url: item.url,
        excerpt: item.excerpt,
        rightsStatus: item.rightsStatus,
        independenceGroup: item.independenceGroup,
        publishedAt: item.publishedAt || null,
      }));
      const sourceUrl = primary.article.link;
      const result = await writeClient.rpc('enqueue_editorial_review_candidate', {
        p_source_id: primary.source.id,
        p_source_name: primary.source.name,
        p_source_url: sourceUrl,
        p_original_title: primary.article.title.slice(0, 500),
        p_original_content: String(primary.article.content || '').slice(0, 100000),
        p_source_published_at: dateOrNull(primary.article.pubDate)?.toISOString() || null,
        p_evidence: evidenceSummary,
        p_draft_title: draftTitle,
        p_draft_content: draftContent,
        p_category: category,
        p_status: queueStatus,
        p_review_result: reviewResult,
        p_writer_model: draftTitle ? 'gemini-2.5-flash' : null,
        p_reviewer_model: reviewResult.model,
        p_prompt_version: PROMPT_VERSION,
        p_story_key: storyKey(primary.article.title),
        p_last_error: lastError,
        p_event_details: {
          evidenceCount: evidence.length,
          distinctOrigins: new Set(evidence.map((item) => item.independenceGroup)).size,
          reviewDecision: reviewResult.decision,
          sourceIds: orderedItems.map((item) => item.source.id),
        },
      });

      if (result.error) {
        if (result.error.code === '23505') {
          const stats = sourceStats.find((item) => item.id === primary.source.id);
          if (stats) stats.skippedDuplicates++;
          continue;
        }
        throw new Error(`No se pudo guardar el candidato en la cola privada: ${result.error.message}`);
      }

      stagedCount++;
      if (queueStatus === 'held' || queueStatus === 'rejected') heldCount++;
      if (queueStatus === 'review_pending') reviewPendingCount++;
      const primaryStats = sourceStats.find((item) => item.id === primary.source.id);
      if (primaryStats) {
        primaryStats.staged++;
        if (queueStatus === 'held' || queueStatus === 'rejected') primaryStats.held++;
      }
      knownUrls.add(sourceUrl);
      knownTitles.push(primary.article.title);
    }

    const finishedAt = new Date();
    return NextResponse.json({
      success: errors.length === 0,
      message: `Candidatos en cola privada: ${stagedCount}. No se publicó ningún artículo.`,
      stagedCount,
      heldCount,
      reviewPendingCount,
      publishedCount: 0,
      run: {
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        enabledSources: eligibleSources.length,
      },
      sources: sourceStats,
      errors: errors.length ? errors : undefined,
    });
  } catch (error: any) {
    console.error('[fetch-news] Flujo editorial privado detenido:', error?.message || error);
    return NextResponse.json(
      { success: false, paused: true, message: 'El flujo editorial privado falló de forma cerrada; no se publicó ningún artículo.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
