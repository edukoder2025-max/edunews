import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { buildArticleUrl } from '@/lib/articleUtils';
import { getSiteUrl } from '@/lib/seoUtils';
import { PUBLIC_NEWS_CUTOFF } from '@/lib/publicationVisibility';
import { hasValidEditorialComparison } from '@/lib/editorialComparison';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Buscar análisis | El Irónico', description: 'Busca análisis editoriales con comparación documentada.', alternates: { canonical: `${getSiteUrl()}/search` } };

type SearchParams = { q?: string };
function excerpt(html: string) { return (html || '').replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 180); }

async function searchAnalyses(query: string) {
  const term = query.trim().replace(/[(),.*%_]/g, ' ').replace(/\s+/g, ' ').slice(0, 80);
  if (!term) return [];
  const { data, error } = await supabase.from('news_articles').select('*').gte('created_at', PUBLIC_NEWS_CUTOFF).not('published_at', 'is', null).or(`ai_title.ilike.%${term}%,ai_content.ilike.%${term}%`).order('published_at', { ascending: false }).limit(100);
  if (error) { console.error('Error buscando análisis editoriales:', error.message); return []; }
  return (data || []).filter((item: any) => item.ai_title && item.ai_content && hasValidEditorialComparison(item.editorial_comparison)).slice(0, 30);
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = (searchParams.q || '').trim().slice(0, 80);
  const articles = await searchAnalyses(query);
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="border-b border-[#d9d1c5] pb-7">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b3732]">Buscar</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-[#191a17] sm:text-5xl">Encontrá un análisis</h1>
        <form action="/search" method="get" className="mt-5 flex max-w-2xl gap-2"><label htmlFor="q" className="sr-only">Palabras para buscar</label><input id="q" name="q" defaultValue={query} maxLength={80} placeholder="Tema, título o palabras clave" className="min-w-0 flex-1 rounded-full border border-[#d8d0c4] bg-[#f8f5ed] px-5 py-3 text-sm text-[#191a17] outline-none focus:border-[#a33a34]"/><button type="submit" className="rounded-full bg-[#1b1b18] px-5 py-3 text-sm font-bold text-[#f8f5ed] hover:bg-[#9b3732]">Buscar</button></form>
        <p className="mt-3 text-sm text-[#5d594f]">Solo se muestran análisis de la nueva etapa que incluyen una comparación editorial válida.</p>
      </header>
      {!query ? <p className="mt-8 rounded-2xl bg-[#eee8dc] p-6 text-sm leading-6 text-[#5d594f]">Ingresá un término para buscar en los análisis publicados.</p> : articles.length === 0 ? <p className="mt-8 rounded-2xl bg-[#eee8dc] p-6 text-sm leading-6 text-[#5d594f]">No encontramos análisis publicados para “{query}”. El archivo histórico no se incluye en esta búsqueda.</p> : <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{articles.map((article: any) => { const href = buildArticleUrl(article.id, article.ai_title, article.category); return <article key={article.id} className="border-t-2 border-[#b23a34] pt-4"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9b3732]">{article.category || 'Análisis editorial'}</p><h2 className="mt-3 font-serif text-xl font-bold leading-snug text-[#191a17] sm:text-2xl"><Link href={href} className="hover:text-[#8d2d29]">{article.ai_title}</Link></h2><p className="mt-3 text-sm leading-6 text-[#5d594f]">{excerpt(article.ai_content)}…</p><Link href={href} className="mt-4 inline-block text-sm font-bold text-[#9b3732]">Leer el análisis →</Link></article>; })}</div>}
    </main>
  );
}
