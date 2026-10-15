import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpenCheck, FileSearch } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildArticleUrl } from '@/lib/articleUtils';
import { normalizeEditorialCategory } from '@/lib/editorialRules';
import { PUBLIC_NEWS_CUTOFF } from '@/lib/publicationVisibility';
import { hasValidEditorialComparison } from '@/lib/editorialComparison';

export const revalidate = 60;

function plainText(html: string | null | undefined): string {
  return (html || '').replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(value: string | null | undefined): string {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Fecha no disponible';
  return new Date(value).toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

async function getPublishedAnalyses() {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .gte('created_at', PUBLIC_NEWS_CUTOFF)
    .order('published_at', { ascending: false })
    .not('published_at', 'is', null)
    .limit(60);

  if (error) {
    console.error('[home] No se pudieron cargar los análisis editoriales:', error.message);
    return [];
  }

  return (data || []).filter((article: any) =>
    Boolean(article.ai_title && article.ai_content && hasValidEditorialComparison(article.editorial_comparison)),
  ).slice(0, 13);
}

function AnalysisCard({ article }: { article: any }) {
  const title = article.ai_title;
  const category = normalizeEditorialCategory(article.category, title);
  const href = buildArticleUrl(article.id, title, category);
  const dek = plainText(article.ai_content).slice(0, 180);

  return (
    <article className="group flex h-full flex-col border-t-2 border-[#b23a34] pt-4">
      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9b3732]">{category} · {formatDate(article.published_at)}</p>
      <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-[#1b1b18] sm:text-2xl">
        <Link href={href} className="decoration-[#b23a34]/30 underline-offset-4 group-hover:text-[#8d2d29] group-hover:underline">{title}</Link>
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#5e5a51]">{dek}{dek ? '…' : ''}</p>
      <p className="mt-4 text-xs font-medium text-[#777064]">Análisis de {article.source_name || 'una pieza periodística'}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#9b3732]">
        Leer la crítica <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}

export default async function Home() {
  const analyses = await getPublishedAnalyses();
  const lead = analyses[0];
  const more = analyses.slice(1);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
      <section className="relative overflow-hidden border-b border-[#cfc6b8] pb-12 sm:pb-16">
        <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[36px] border-[#b23a34]/[.07] sm:h-96 sm:w-96" />
        <div className="relative max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9b3732]">Lectura crítica del periodismo</p>
          <h1 className="mt-5 max-w-4xl font-serif text-4xl font-bold leading-[1.05] tracking-[-.035em] text-[#191a17] sm:text-6xl lg:text-7xl">
            No repetimos la noticia. <span className="text-[#a33a34]">Examinamos cómo fue contada.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#5d594f] sm:text-lg">
            El Irónico analiza las decisiones editoriales de las fuentes originales y las contrasta con evidencia. Cada nota debe ser una crítica propia, clara y sustentada; no una versión reescrita del mismo feed.
          </p>
          <Link href="/metodologia" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1b1b18] px-5 py-3 text-sm font-bold text-[#f8f5ed] transition hover:bg-[#9b3732]">
            Cómo trabajamos <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {lead ? (
        <section aria-labelledby="latest-analysis-title" className="grid gap-10 border-b border-[#cfc6b8] py-10 sm:py-14 lg:grid-cols-[1.55fr_.75fr] lg:gap-16">
          <article className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b3732]">Análisis más reciente</p>
            <p className="mt-3 text-xs font-semibold text-[#777064]">{normalizeEditorialCategory(lead.category, lead.ai_title)} · {formatDate(lead.published_at)}</p>
            <h2 id="latest-analysis-title" className="mt-4 font-serif text-3xl font-bold leading-tight tracking-[-.025em] text-[#191a17] sm:text-5xl">
              <Link href={buildArticleUrl(lead.id, lead.ai_title, lead.category)} className="hover:text-[#8d2d29]">{lead.ai_title}</Link>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d594f]">{plainText(lead.ai_content).slice(0, 260)}{plainText(lead.ai_content).length > 260 ? '…' : ''}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#777064]">
              <span>Fuente analizada: <strong className="text-[#272722]">{lead.source_name || 'no identificada'}</strong></span>
              <Link href={buildArticleUrl(lead.id, lead.ai_title, lead.category)} className="inline-flex items-center gap-2 font-bold text-[#9b3732]">
                Abrir análisis <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </article>
          <aside className="self-start rounded-3xl bg-[#e9e2d6] p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#777064]">La diferencia</p>
            <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight text-[#191a17]">Una nota propia, más una comparación precisa.</h3>
            <p className="mt-3 text-sm leading-6 text-[#5d594f]">El artículo desarrolla la crítica para el lector. En un bloque separado mostramos qué decisiones tomó la fuente y qué hizo El Irónico, con evidencia y sin copiar la nota original.</p>
          </aside>
        </section>
      ) : (
        <section className="my-10 grid gap-6 rounded-3xl border border-[#d8d0c4] bg-[#eee8dc] p-6 sm:my-14 sm:grid-cols-[auto_1fr] sm:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f7f3ea] text-[#9b3732]">
            <BookOpenCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b3732]">Nueva etapa editorial</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-[#191a17] sm:text-3xl">Estamos preparando las primeras críticas.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5d594f]">No mostramos el archivo anterior como si formara parte de esta etapa. Publicaremos una pieza cuando el análisis, la comparación con la fuente y sus evidencias estén completos.</p>
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section aria-labelledby="more-analyses-title" className="py-10 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#cfc6b8] pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b3732]">Archivo de la nueva etapa</p>
              <h2 id="more-analyses-title" className="mt-2 font-serif text-2xl font-bold text-[#191a17] sm:text-3xl">Más críticas editoriales</h2>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#777064]"><FileSearch size={14} aria-hidden="true" /> Solo artículos con comparación completa</span>
          </div>
          <div className="mt-7 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((article: any) => <AnalysisCard key={article.id} article={article} />)}
          </div>
        </section>
      )}

      <section className="grid gap-8 border-t border-[#cfc6b8] py-10 sm:py-14 md:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b3732]">01 · Observamos</p>
          <h2 className="mt-3 font-serif text-xl font-semibold text-[#191a17]">La pieza, no la persona</h2>
          <p className="mt-2 text-sm leading-6 text-[#5d594f]">Analizamos decisiones visibles: el título, la evidencia, las atribuciones, el contexto y la estructura.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b3732]">02 · Contrastamos</p>
          <h2 className="mt-3 font-serif text-xl font-semibold text-[#191a17]">Afirmaciones y límites</h2>
          <p className="mt-2 text-sm leading-6 text-[#5d594f]">Cada crítica debe apoyarse en la pieza y en evidencias identificables; lo que no se puede comprobar se declara como límite.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b3732]">03 · Explicamos</p>
          <h2 className="mt-3 font-serif text-xl font-semibold text-[#191a17]">Qué habría que mejorar</h2>
          <p className="mt-2 text-sm leading-6 text-[#5d594f]">La comparación muestra por separado qué hizo la fuente y cómo El Irónico resolvió ese aspecto en su propia pieza.</p>
          <Link href="/metodologia" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#9b3732]">Leer la metodología <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      </section>

    </main>
  );
}
