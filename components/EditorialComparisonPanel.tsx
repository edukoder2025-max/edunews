import { ArrowUpRight, Check, FileSearch } from 'lucide-react';
import type { EditorialComparisonData } from '@/lib/editorialComparison';

type Props = {
  comparison: EditorialComparisonData;
  sourceName: string;
  sourceTitle: string;
  sourceUrl: string;
};

function safeHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function EditorialComparisonPanel({ comparison, sourceName, sourceTitle, sourceUrl }: Props) {
  const originalUrl = safeHttpsUrl(sourceUrl);

  return (
    <section id="comparacion" aria-labelledby="comparison-title" className="scroll-mt-24 rounded-[1.75rem] border border-[#d8d0c4] bg-[#eee8dc] p-5 sm:p-8">
      <div className="max-w-3xl">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#a43a33]"><FileSearch size={15} aria-hidden="true" /> Lectura comparada</p>
        <h2 id="comparison-title" className="mt-3 font-serif text-2xl font-bold leading-tight text-[#191a17] sm:text-3xl">Qué hizo la fuente y qué hizo El Irónico</h2>
        <p className="mt-3 text-sm leading-6 text-[#5d594f]">Observaciones breves sobre decisiones visibles de la pieza y respuestas concretas de este análisis. No atribuimos intenciones ni reproducimos el texto completo de terceros.</p>
      </div>
      <div className="mt-6 rounded-2xl border border-[#d8d0c4] bg-[#f8f5ed] p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#777064]">Pieza analizada · {sourceName || 'Fuente original'}</p>
        <p className="mt-2 font-serif text-lg font-semibold leading-snug text-[#191a17]">{sourceTitle || 'Título original no disponible'}</p>
        {originalUrl && <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#9e332f] underline decoration-[#c89b8f] underline-offset-4 hover:text-[#6f2421]">Abrir la publicación original <ArrowUpRight size={14} aria-hidden="true" /></a>}
      </div>
      <div className="mt-6 space-y-4">
        {comparison.sourceFindings.map((finding, index) => {
          const improvement = comparison.elIronicoImprovements[index];
          return (
            <article key={`${finding.aspect}-${index}`} className="grid gap-4 rounded-2xl border border-[#d8d0c4] bg-[#f8f5ed] p-5 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[.12em] text-[#802d2a]">La pieza fuente · {finding.aspect}</h3>
                <p className="mt-2 text-sm leading-6 text-[#272722]">{finding.observation}</p>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                  {finding.evidenceUrls.map((rawUrl, urlIndex) => {
                    const url = safeHttpsUrl(rawUrl);
                    if (!url) return null;
                    return <a key={`${url}-${urlIndex}`} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#9e332f] underline underline-offset-2">Evidencia {urlIndex + 1} <ArrowUpRight size={11} aria-hidden="true" /></a>;
                  })}
                </div>
              </div>
              <div className="border-t border-[#e5ddd1] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#35513c]"><Check size={14} aria-hidden="true" /> La respuesta de El Irónico · {improvement.aspect}</h3>
                <p className="mt-2 text-sm leading-6 text-[#272722]">{improvement.action}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
