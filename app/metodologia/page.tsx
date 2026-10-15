import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl } from '@/lib/seoUtils';

export const metadata: Metadata = {
  title: 'Metodología editorial | El Irónico',
  description: 'Cómo El Irónico examina críticamente decisiones periodísticas observables y comunica evidencia y límites.',
  alternates: { canonical: `${getSiteUrl()}/metodologia` },
};

const principles = [
  { title: 'Una pieza concreta, no una etiqueta', text: 'El punto de partida es un artículo identificable. Observamos decisiones que pueden leerse en esa pieza —título, estructura, fuentes, atribuciones, cifras y contexto—, no una supuesta intención de sus autores.' },
  { title: 'Crítica demostrable', text: 'Una observación debe apoyarse en la pieza y en evidencias citables. Si el material disponible no permite sostener una crítica periodística sustantiva, la candidata debe quedar retenida o rechazarse; no se inventa un defecto para completar un formato.' },
  { title: 'Artículo propio y comparación separada', text: 'El texto principal construye una tesis y un análisis para el lector. Un módulo distinto resume, aspecto por aspecto, qué hizo la fuente y qué hizo El Irónico en su respuesta, con enlaces de evidencia. No es una reproducción del original.' },
  { title: 'Límites explícitos', text: 'El material de apoyo debe contar con permisos editoriales adecuados para su uso y cita; no reproducimos la pieza completa. Un enlace o un conjunto acotado de materiales no demuestra todo lo ocurrido ni la intención de quienes publicaron. La crítica debe precisar qué pudo comprobarse, qué no y dónde termina la inferencia.' },
];

export default function MetodologiaPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl border-b border-[#d9d1c5] pb-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9b3732]">Criterios de publicación</p>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-[-.03em] text-[#191a17] sm:text-6xl">Cómo leemos el periodismo</h1>
        <p className="mt-5 text-base leading-7 text-[#5d594f] sm:text-lg">El Irónico no pretende ser un servicio de noticias reescritas ni certificar neutralidad. Su propuesta editorial es examinar cómo una pieza periodística construye su relato y hacer visible el alcance —y los límites— de esa lectura.</p>
      </header>
      <section className="mt-9 grid gap-5 md:grid-cols-2">
        {principles.map((item, index) => <article key={item.title} className="rounded-2xl border border-[#d9d1c5] bg-[#f8f5ed] p-6"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#9b3732]">0{index + 1} · Principio</p><h2 className="mt-3 font-serif text-2xl font-bold text-[#191a17]">{item.title}</h2><p className="mt-3 text-sm leading-6 text-[#5d594f]">{item.text}</p></article>)}
      </section>
      <section className="mt-8 rounded-2xl bg-[#eee8dc] p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-bold text-[#191a17]">Qué puede y qué no puede hacer la IA</h2>
        <div className="mt-4 grid gap-5 text-sm leading-6 text-[#5d594f] md:grid-cols-2">
          <p>En el flujo editorial previsto, modelos de IA pueden asistir en la preparación de un borrador crítico, ordenar observaciones y proponer una comparación estructurada con referencias. Una segunda llamada al mismo proveedor no constituye corroboración independiente ni prueba de veracidad, originalidad o imparcialidad.</p>
          <p>Los modelos pueden equivocarse, omitir contexto o producir afirmaciones no sustentadas. La herramienta no puede certificar por sí misma la verdad ni conocer motivos privados. La revisión editorial final corresponde a Zapia; esa etapa tampoco convierte automáticamente cada afirmación en un hecho verificado.</p>
        </div>
        <p className="mt-5 border-t border-[#d9d1c5] pt-4 text-sm font-semibold leading-6 text-[#38362f]">Estado: la publicación y el flujo de revisión automatizada permanecen pausados durante esta etapa de revisión. No afirmamos que el proceso descrito esté operando como un servicio activo.</p>
      </section>
      <p className="mt-8 text-sm leading-6 text-[#5d594f]">La comparación editorial enlaza evidencias puntuales, no sustituye una revisión factual independiente. El texto fuente completo no se reproduce en El Irónico. <Link href="/nosotros" className="font-semibold text-[#9b3732] underline underline-offset-4">Conocé el proyecto</Link>.</p>
    </main>
  );
}
