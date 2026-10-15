import type { Metadata } from 'next';
import Link from 'next/link';
import { TOPIC_HUBS } from '@/lib/topicHubs';
import { getSiteUrl } from '@/lib/seoUtils';

export const metadata: Metadata = { title: 'Temas | El Irónico', description: 'Temas de análisis crítico de piezas periodísticas.', alternates: { canonical: `${getSiteUrl()}/temas` } };

export default function TopicsPage() {
  return <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16"><header className="mb-9 max-w-3xl border-b border-[#d9d1c5] pb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b3732]">Índice temático</p><h1 className="mt-3 font-serif text-4xl font-bold text-[#191a17] sm:text-5xl">Temas para leer críticamente</h1><p className="mt-4 text-sm leading-6 text-[#5d594f]">Agrupamos los análisis editoriales por asunto. Solo aparecen piezas de la nueva etapa con texto propio y comparación documentada; el archivo histórico queda fuera.</p></header><div className="grid gap-5 md:grid-cols-2">{TOPIC_HUBS.map((topic) => <Link key={topic.slug} href={`/temas/${topic.slug}`} className="group rounded-2xl border border-[#d9d1c5] bg-[#f8f5ed] p-6 transition hover:border-[#b23a34]"><h2 className="font-serif text-2xl font-bold text-[#191a17] group-hover:text-[#9b3732]">{topic.title}</h2><p className="mt-3 text-sm leading-6 text-[#5d594f]">{topic.description}</p><span className="mt-5 inline-block text-sm font-bold text-[#9b3732]">Ver análisis →</span></Link>)}</div></main>;
}
