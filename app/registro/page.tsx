import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro editorial | El Irónico',
  description: 'Cómo se seleccionan, procesan, verifican y corrigen las noticias de El Irónico.',
  alternates: {
    canonical: '/registro',
  },
};

const steps = [
  {
    title: 'Selección de fuentes',
    text: 'Revisamos fuentes públicas, medios y organismos que ofrecen información verificable. La fuente original se conserva en cada artículo cuando está disponible.',
  },
  {
    title: 'Procesamiento con asistencia de IA',
    text: 'La inteligencia artificial ayuda a ordenar, resumir y detectar lenguaje valorativo. No reemplaza la atribución de declaraciones ni autoriza a inventar datos.',
  },
  {
    title: 'Contexto y contraste',
    text: 'Cuando el tema lo permite, se incorporan fuentes adicionales para diferenciar hechos confirmados, declaraciones, interpretaciones y aspectos todavía pendientes.',
  },
  {
    title: 'Correcciones',
    text: 'Si detectás un error factual, una atribución incorrecta o un enlace roto, podés informarlo desde la página de contacto para que sea revisado.',
  },
];

export default function RegistroPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <header className="space-y-5 mb-12">
        <p className="text-primary text-xs font-black uppercase tracking-[0.25em]">Transparencia</p>
        <h1 className="text-4xl md:text-6xl font-black font-serif text-white leading-tight">
          Registro editorial
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
          Este espacio explica cómo El Irónico transforma información pública en noticias,
          qué papel cumple la inteligencia artificial y cómo tratamos las correcciones.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Proceso editorial">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-primary text-sm font-black mb-4">0{index + 1}</div>
            <h2 className="text-xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-slate-300 leading-relaxed">{step.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="text-xl font-bold text-white mb-3">Qué no hacemos</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-300 leading-relaxed">
          <li>No presentamos opiniones de terceros como hechos comprobados.</li>
          <li>No inventamos cifras, nombres, citas ni fuentes.</li>
          <li>No copiamos artículos completos de otros medios.</li>
          <li>No eliminamos una corrección sin dejar constancia del cambio relevante.</li>
        </ul>
      </section>
    </main>
  );
}
