import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/seoUtils';

export const metadata: Metadata = {
  title: 'Sobre El Irónico',
  description: 'El Irónico es un proyecto de lectura crítica de las decisiones editoriales observables en piezas periodísticas.',
  alternates: { canonical: `${getSiteUrl()}/nosotros` },
};

export default function NosotrosPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl border-b border-[#d9d1c5] pb-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b3732]">El proyecto</p>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-[-.03em] text-[#191a17] sm:text-6xl">Sobre El Irónico</h1>
        <p className="mt-5 text-lg leading-7 text-[#5d594f]">No reescribimos noticias ni presentamos una puntuación de objetividad. Nos interesa cómo una pieza construye lo que cuenta: qué afirma, con qué evidencia, a quién atribuye la información y qué contexto ofrece.</p>
      </header>
      <section className="mt-9 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-[#d9d1c5] bg-[#f8f5ed] p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold text-[#191a17]">Una crítica que también se hace cargo</h2>
          <p className="mt-4 text-sm leading-6 text-[#5d594f]">Cada análisis debe poder sostener sus propias decisiones: presentar una tesis clara, distinguir evidencia de interpretación, citar lo que utiliza y explicitar límites. La crítica se dirige a la pieza y a sus decisiones observables, no a ataques personales ni a intenciones que no puedan demostrarse.</p>
        </article>
        <article className="rounded-2xl border border-[#d9d1c5] bg-[#eee8dc] p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold text-[#191a17]">Una etapa en revisión</h2>
          <p className="mt-4 text-sm leading-6 text-[#5d594f]">El sitio está revisando su modelo editorial. La publicación y el flujo automatizado de revisión continúan pausados; el archivo histórico no se presenta como parte de esta nueva etapa. No se publicará una crítica si la evidencia disponible no permite sostenerla.</p>
        </article>
      </section>
      <p className="mt-8 text-sm leading-6 text-[#5d594f]">Los detalles del enfoque, las limitaciones de la IA y el estado del proceso están en la <Link href="/metodologia" className="font-semibold text-[#9b3732] underline underline-offset-4">metodología editorial</Link>.</p>
    </main>
  );
}
