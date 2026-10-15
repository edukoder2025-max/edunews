import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, ExternalLink, FileSearch } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { applyEditorialOverride, getEditorialOverride } from '@/lib/editorialOverrides';
import { buildArticleUrl, extractArticleId, normalizeCategorySlug, slugify } from '@/lib/articleUtils';
import { generateArticleDescription, generateArticleTitle, generateCategoryKeywords, getSiteUrl } from '@/lib/seoUtils';
import { normalizeEditorialCategory } from '@/lib/editorialRules';
import { PUBLIC_NEWS_CUTOFF } from '@/lib/publicationVisibility';
import ShareButtons from '@/components/ShareButtons';
import AdSense from '@/components/AdSense';
import { AD_SLOTS } from '@/lib/adSlots';
import EditorialComparisonPanel from '@/components/EditorialComparisonPanel';
import { parseEditorialComparison, sanitizeEditorialHtml } from '@/lib/editorialComparison';
import type { EditorialComparisonData } from '@/lib/editorialComparison';

export const revalidate = 60;

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .gte('created_at', PUBLIC_NEWS_CUTOFF)
    .not('published_at', 'is', null)
    .single();

  if (error || !data) return null;
  const article = applyEditorialOverride(data) as any;
  const comparison = parseEditorialComparison(article.editorial_comparison);
  // Fail closed: no article from the new stage is visible/indexable without its own body and separate comparison.
  if (!article.ai_title?.trim() || !article.ai_content?.trim() || !comparison) return null;
  return { ...article, editorial_comparison: comparison };
}

export async function generateMetadata({ params }: { params: { category: string; articlePath: string } }): Promise<Metadata> {
  const article = await getArticle(extractArticleId(params.articlePath));
  if (!article) return { title: 'Análisis no disponible', robots: { index: false, follow: false } };
  const category = normalizeEditorialCategory(article.category, article.ai_title);
  const canonicalUrl = buildArticleUrl(article.id, article.ai_title, category, getSiteUrl());
  const description = generateArticleDescription(article.ai_title, article.ai_content, category);
  const title = generateArticleTitle(article.ai_title, category);
  const keywords = generateCategoryKeywords(category);
  return {
    title,
    description,
    keywords: `${keywords}, crítica periodística, análisis editorial`,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: article.ai_title,
      description,
      url: canonicalUrl,
      type: 'article',
      siteName: 'El Irónico',
      locale: 'es_AR',
      publishedTime: article.published_at,
      authors: ['El Irónico'],
    },
    twitter: { card: 'summary', title: article.ai_title, description },
  };
}

async function getRelatedArticles(category: string, currentId: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .ilike('category', category)
    .neq('id', currentId)
    .gte('created_at', PUBLIC_NEWS_CUTOFF)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(8);
  if (error) return [];
  return (data || []).filter((item: any) => item.id && item.published_at && item.ai_title && item.ai_content && parseEditorialComparison(item.editorial_comparison)).slice(0, 3);
}

function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null; } catch { return null; }
}

function formatDate(value: string | null | undefined): string | null {
  if (!value || Number.isNaN(new Date(value).getTime())) return null;
  return new Date(value).toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function ArticlePage({ params }: { params: { category: string; articlePath: string } }) {
  const articleId = extractArticleId(params.articlePath);
  const article = await getArticle(articleId);
  if (!article) notFound();

  const override = getEditorialOverride(article.id);
  if (override?.redirectToArticleId) {
    const canonicalArticle = await getArticle(override.redirectToArticleId);
    if (canonicalArticle) redirect(buildArticleUrl(canonicalArticle.id, canonicalArticle.ai_title, canonicalArticle.category));
  }

  const category = normalizeEditorialCategory(article.category, article.ai_title);
  const expectedPath = `${slugify(article.ai_title) ? `${slugify(article.ai_title)}-${article.id}` : article.id}`;
  if (params.category !== normalizeCategorySlug(category) || params.articlePath !== expectedPath) {
    redirect(buildArticleUrl(article.id, article.ai_title, category));
  }

  const comparison = article.editorial_comparison as EditorialComparisonData;
  const related = await getRelatedArticles(article.category || '', article.id);
  const canonicalUrl = buildArticleUrl(article.id, article.ai_title, category, getSiteUrl());
  const articleDate = formatDate(article.published_at);
  const sourceUrl = safeHttpsUrl(article.source_url);
  const description = generateArticleDescription(article.ai_title, article.ai_content, category);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.ai_title,
    description,
    datePublished: article.published_at,
    author: { '@type': 'Organization', name: 'El Irónico', url: getSiteUrl() },
    publisher: { '@type': 'Organization', name: 'El Irónico', url: getSiteUrl() },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    articleSection: category,
    isAccessibleForFree: true,
  };

  return (
    <article className="mx-auto w-full max-w-5xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <nav aria-label="Ruta de navegación" className="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#777064]">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[#9b3732]"><ArrowLeft size={13} aria-hidden="true" /> Portada</Link>
        <span aria-hidden="true">/</span><Link href={`/categoria/${normalizeCategorySlug(category)}`} className="hover:text-[#9b3732]">{category}</Link>
        <span aria-hidden="true">/</span><span aria-current="page">Análisis</span>
      </nav>

      <header className="border-b border-[#d9d1c5] pb-8 sm:pb-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-[.13em] text-[#777064]">
          <span className="rounded-full bg-[#eadfd4] px-3 py-1 text-[#87332e]">Crítica periodística</span>
          <span>{category}</span>
          {articleDate && <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} aria-hidden="true" />{articleDate}</span>}
        </div>
        <h1 className="mt-5 max-w-4xl font-serif text-4xl font-bold leading-[1.05] tracking-[-.035em] text-[#191a17] sm:text-6xl">{article.ai_title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[#5d594f]">Un análisis de cómo la pieza original presenta la información, qué sostiene con evidencia y qué decisiones editoriales merecen una lectura crítica.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#5d594f]">
          <span>Fuente analizada: <strong className="text-[#272722]">{article.source_name || 'Fuente no identificada'}</strong></span>
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#9b3732] underline underline-offset-4">
              Ver pieza original <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Secciones de este análisis" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            <a href="#analisis" className="text-[#38362f] underline decoration-[#c6bbae] underline-offset-4 hover:text-[#9b3732]">La crítica</a>
            <a href="#comparacion" className="text-[#38362f] underline decoration-[#c6bbae] underline-offset-4 hover:text-[#9b3732]">Comparación</a>
          </nav>
          <ShareButtons url={canonicalUrl} title={article.ai_title} />
        </div>
      </header>

      <section id="analisis" aria-label="Artículo crítico de El Irónico" className="mx-auto max-w-3xl scroll-mt-8 py-8 sm:py-12">
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#191a17] prose-p:text-[#302f2a] prose-p:leading-[1.85] prose-a:text-[#9b3732] prose-strong:text-[#191a17] prose-blockquote:border-l-[#a33a34] prose-blockquote:text-[#5d594f]">
          <div dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(article.ai_content) }} />
        </div>
      </section>

      <div className="mx-auto max-w-3xl border-t border-[#d9d1c5] pt-5 text-sm leading-6 text-[#5d594f]">
        <p><strong className="text-[#272722]">Criterio editorial:</strong> la evaluación se refiere a decisiones visibles en la pieza y a lo que permiten sostener las evidencias disponibles; no presume intenciones de sus autores.</p>
      </div>

      <div className="mx-auto my-10 max-w-5xl">
        <EditorialComparisonPanel
          comparison={comparison}
          sourceName={article.source_name || 'Fuente original'}
          sourceTitle={article.original_title || ''}
          sourceUrl={sourceUrl || ''}
        />
      </div>

      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
        <div className="mx-auto my-10 max-w-5xl rounded-2xl border border-[#d9d1c5] bg-[#eee8dc] p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#777064]">Publicidad</span>
          <AdSense slot={AD_SLOTS.ARTICLE_MIDDLE} format="auto" className="mt-3 w-full" />
        </div>
      )}

      <section id="fuentes" className="mx-auto mt-10 max-w-5xl border-t border-[#d9d1c5] pt-6">
        <h2 className="font-serif text-xl font-bold text-[#191a17]">Fuentes de esta lectura</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d594f]">La comparación anterior enlaza las evidencias utilizadas para cada observación. La fuente original se identifica arriba; el texto completo de terceros no se reproduce aquí.</p>
        <a href="#comparacion" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#9b3732]">Ver evidencias <FileSearch size={15} aria-hidden="true" /></a>
      </section>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-5xl border-t border-[#d9d1c5] pt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold text-[#191a17]">Más análisis de {category}</h2>
            <Link href={`/categoria/${normalizeCategorySlug(category)}`} className="inline-flex items-center gap-1 text-sm font-bold text-[#9b3732]">Ver sección <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {related.map((item: any) => (
              <Link key={item.id} href={buildArticleUrl(item.id, item.ai_title, item.category)} className="rounded-2xl border border-[#d9d1c5] bg-[#f8f5ed] p-5 transition hover:-translate-y-0.5 hover:border-[#b23a34]">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#9b3732]">Crítica editorial</p>
                <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-[#191a17]">{item.ai_title}</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#9b3732]">Leer <ArrowRight size={13} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
