import { NextResponse } from 'next/server';
import { fetchRssFeed } from '@/lib/rss';
import { rewriteNews } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { findAlternativeSources } from '@/lib/googleCSE';
import { fetchRelevantImage } from '@/lib/imageFetcher';
import { buildArticleUrl } from '@/lib/articleUtils';
import { NEWS_SOURCES } from '@/lib/newsSources';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SourceRunStats = {
  id: string;
  name: string;
  section: string;
  feedUrl: string;
  fetched: number;
  fresh: number;
  selected: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  published: number;
  errors: string[];
};

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  // Vercel sends Authorization: Bearer $CRON_SECRET for scheduled crons.
  // Until the secret is configured, preserve the existing manual behavior but
  // make the missing protection visible in the deployment logs.
  if (!cronSecret) {
    console.warn('[fetch-news] CRON_SECRET no está configurado; endpoint sin protección de cron.');
    return true;
  }

  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

async function articleAlreadyExists(sourceUrl: string, originalTitle: string) {
  if (sourceUrl) {
    const { data } = await supabase
      .from('news_articles')
      .select('id')
      .eq('source_url', sourceUrl)
      .limit(1)
      .maybeSingle();
    if (data?.id) return true;
  }

  if (originalTitle) {
    const { data } = await supabase
      .from('news_articles')
      .select('id')
      .eq('original_title', originalTitle)
      .limit(1)
      .maybeSingle();
    if (data?.id) return true;
  }

  return false;
}

export async function GET(request: Request) {
  const startedAt = new Date();

  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const loadAll = searchParams.get('all') === 'true';
    const defaultMaxArticles = loadAll ? 5 : 3;
    const errors: string[] = [];
    const sourceStats: SourceRunStats[] = [];
    let processedCount = 0;

    const enabledSources = NEWS_SOURCES.filter((source) => source.enabled);

    for (const source of enabledSources) {
      const stats: SourceRunStats = {
        id: source.id,
        name: source.name,
        section: source.section,
        feedUrl: source.url,
        fetched: 0,
        fresh: 0,
        selected: 0,
        skippedDuplicates: 0,
        skippedInvalid: 0,
        published: 0,
        errors: [],
      };

      try {
        const articles = await fetchRssFeed(source.url);
        stats.fetched = articles.length;

        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

        const freshArticles = articles.filter((article: any) => {
          const parsedDate = article.pubDate ? new Date(article.pubDate) : new Date();
          return !Number.isNaN(parsedDate.getTime()) && parsedDate > twoDaysAgo;
        });

        stats.fresh = freshArticles.length;
        const topArticles = freshArticles.slice(0, Math.min(defaultMaxArticles, source.maxArticlesPerRun));
        stats.selected = topArticles.length;

        for (const article of topArticles) {
          if (!article.link || !article.title) {
            stats.skippedInvalid++;
            continue;
          }

          try {
            if (await articleAlreadyExists(article.link, article.title)) {
              stats.skippedDuplicates++;
              continue;
            }

            const alternatives = await findAlternativeSources(article.title, article.link);
            const rewritten = await rewriteNews(article.title, article.content, alternatives);

            if (!rewritten || rewritten.error) {
              const reason = rewritten?.error || 'Respuesta vacía del redactor';
              const message = `${source.name}: error al reescribir “${article.title}”: ${reason}`;
              stats.errors.push(message);
              errors.push(message);
              continue;
            }

            let finalImageUrl = article.imageUrl || null;
            if (!finalImageUrl) {
              try {
                finalImageUrl = await fetchRelevantImage(article.title, article.link);
              } catch (imageError: any) {
                console.warn('[fetch-news] Error obteniendo imagen:', imageError?.message || imageError);
              }
            }

            const parsedDate = article.pubDate ? new Date(article.pubDate) : new Date();
            const publishedAt = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
            const insertPayload: any = {
              original_title: article.title,
              ai_title: rewritten.new_title,
              original_content: article.content,
              ai_content: rewritten.new_content,
              category: rewritten.category || source.section || 'General',
              image_url: finalImageUrl,
              source_url: article.link,
              source_name: article.sourceName || source.name,
              published_at: publishedAt,
              bias_detected: rewritten.bias_detected || null,
              bias_score: rewritten.bias_score || null,
              sources_used: rewritten.sources_used || (alternatives.length > 0
                ? alternatives.map((alternative: any) => alternative.source)
                : [article.sourceName || source.name]),
            };

            let { data: insertedRow, error: dbError } = await supabase
              .from('news_articles')
              .insert(insertPayload)
              .select('id')
              .single();

            // Compatibilidad con instalaciones que todavía no tienen las
            // columnas opcionales del análisis de sesgo.
            if (dbError && (dbError.message?.includes('column') || dbError.code === 'PGRST204')) {
              const fallbackPayload = { ...insertPayload };
              delete fallbackPayload.bias_detected;
              delete fallbackPayload.bias_score;
              delete fallbackPayload.sources_used;

              const { data: fallbackRow, error: fallbackError } = await supabase
                .from('news_articles')
                .insert(fallbackPayload)
                .select('id')
                .single();

              dbError = fallbackError;
              if (!dbError) insertedRow = fallbackRow;
            }

            if (dbError) {
              const message = `${source.name}: error en BD para “${article.title}”: ${dbError.message}`;
              stats.errors.push(message);
              errors.push(message);
              continue;
            }

            processedCount++;
            stats.published++;

            if (insertedRow?.id) {
              const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elironico.com';
              const articleUrl = buildArticleUrl(
                insertedRow.id,
                rewritten.new_title || article.title,
                rewritten.category || source.section || 'General',
                siteUrl,
              );

              fetch(`${siteUrl}/api/indexnow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: articleUrl }),
              }).catch((error) => console.warn('[IndexNow] Ping falló:', error?.message));
            }
          } catch (articleError: any) {
            const message = `${source.name}: error procesando “${article.title}”: ${articleError?.message || articleError}`;
            stats.errors.push(message);
            errors.push(message);
          }
        }
      } catch (sourceError: any) {
        const message = `${source.name}: RSS no disponible: ${sourceError?.message || sourceError}`;
        stats.errors.push(message);
        errors.push(message);
      }

      sourceStats.push(stats);
    }

    const finishedAt = new Date();
    return NextResponse.json({
      success: true,
      message: `Proceso completado. Nuevas noticias agregadas: ${processedCount}`,
      processedCount,
      run: {
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        enabledSources: enabledSources.length,
      },
      sources: sourceStats,
      // Se conserva debugInfo para no romper consumidores existentes.
      debugInfo: sourceStats,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error general procesando feeds:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
