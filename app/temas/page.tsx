import type { Metadata } from 'next';
import Link from 'next/link';
import { TOPIC_HUBS } from '@/lib/topicHubs';
import { getSiteUrl } from '@/lib/seoUtils';

export const metadata: Metadata = {
  title: 'Temas de interés | El Irónico',
  description: 'Guías y noticias agrupadas por temas de interés para encontrar información útil y actualizada.',
  alternates: { canonical: `${getSiteUrl()}/temas` },
};

export default function TopicsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <header className="mb-12 max-w-3xl">
        <p className="text-primary text-xs font-black uppercase tracking-[0.25em]">Información útil</p>
        <h1 className="text-4xl md:text-6xl font-black font-serif text-white leading-tight mt-4">
          Temas de interés
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed mt-5">
          Noticias y explicadores agrupados para encontrar información relevante sin perderse entre publicaciones aisladas.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {TOPIC_HUBS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/temas/${topic.slug}`}
            className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 hover:border-primary/50 transition-colors"
          >
            <h2 className="text-2xl font-black font-serif text-white group-hover:text-primary transition-colors">
              {topic.title}
            </h2>
            <p className="text-slate-400 leading-relaxed mt-3">{topic.description}</p>
            <span className="inline-block text-primary text-xs font-black uppercase tracking-widest mt-6">
              Ver cobertura →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
