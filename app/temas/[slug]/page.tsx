import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildArticleUrl } from '@/lib/articleUtils';
import { getSiteUrl } from '@/lib/seoUtils';
import { getTopicHub, getTopicOrFilters } from '@/lib/topicHubs';
import { PUBLIC_NEWS_CUTOFF } from '@/lib/publicationVisibility';
import { hasValidEditorialComparison } from '@/lib/editorialComparison';

export const revalidate = 300;

async function getTopicArticles(slug: string) {
  const topic = getTopicHub(slug);
  if (!topic) return [];
  const { data, error } = await supabase.from('news_articles').select('*').or(getTopicOrFilters(topic.searchTerms)).gte('created_at', PUBLIC_NEWS_CUTOFF).not('published_at', 'is', null).order('published_at', { ascending: false }).limit(100);
  if (error) { console.error('Error cargando tema:', error.message); return []; }
  return (data || []).filter((item: any) => item.ai_title && item.ai_content && hasValidEditorialComparison(item.editorial_comparison)).slice(0, 24);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const topic = getTopicHub(params.slug);
  if (!topic) return { title: 'Tema no encontrado', robots: { index: false, follow: false } };
  return { title: `${topic.title} | El Irónico`, description: `${topic.description} Análisis con comparación editorial documentada.`, alternates: { canonical: `${getSiteUrl()}/temas/${topic.slug}` }, openGraph: { title: `${topic.title} | El Irónico`, description: topic.description, url: `${getSiteUrl()}/temas/${topic.slug}`, type: 'website' } };
}

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const topic = getTopicHub(params.slug);
  if (!topic) notFound();
  const articles = await getTopicArticles(topic.slug);
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/temas" className="text-sm font-semibold text-[#9b3732] underline underline-offset-4">← Todos los temas</Link>
      <header className="mt-7 border-b border-[#d9d1c5] pb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b3732]">Tema editorial</p><h1 className="mt-3 font-serif text-4xl font-bold text-[#191a17] sm:text-5xl">{topic.title}</h1><p className="mt-4 max-w-3xl text-sm leading-6 text-[#5d594f]">{topic.description} En esta sección solo se muestran análisis propios que incluyen una comparación documentada con la pieza fuente.</p></header>
      {articles.length === 0 ? <p className="mt-8 rounded-2xl bg-[#eee8dc] p-6 text-sm leading-6 text-[#5d594f]">Todavía no hay análisis publicados en este tema. El archivo histórico no se presenta como parte de la nueva etapa.</p> : <div className="mt-8 grid gap-6 md:grid-cols-2">{articles.map((article: any) => { const title = article.ai_title; return <article key={article.id} className="rounded-2xl border border-[#d9d1c5] bg-[#f8f5ed] p-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9b3732]">{article.category || 'Análisis editorial'}</p><h2 className="mt-3 font-serif text-2xl font-bold leading-snug text-[#191a17]"><Link href={buildArticleUrl(article.id, title, article.category)} className="hover:text-[#9b3732]">{title}</Link></h2><p className="mt-4 text-sm leading-6 text-[#5d594f]">{(article.ai_content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)}…</p><div className="mt-5 flex items-center gap-2 text-xs text-[#777064]"><Calendar size={13} aria-hidden="true" />{article.published_at ? new Date(article.published_at).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : 'Fecha no disponible'}</div></article>; })}</div>}
    </main>
  );
}
