export type TopicHub = {
  slug: string;
  title: string;
  description: string;
  searchTerms: string[];
};

/** Temas permanentes construidos sobre la demanda real de búsqueda. */
export const TOPIC_HUBS: TopicHub[] = [
  {
    slug: 'anses-jubilaciones-y-pensiones',
    title: 'ANSES, jubilaciones y pensiones',
    description: 'Noticias, fechas, cambios y explicadores sobre jubilaciones, pensiones y pagos de ANSES.',
    searchTerms: ['anses', 'jubilación', 'jubilaciones', 'pensión', 'pensiones'],
  },
  {
    slug: 'empleo-y-trabajo',
    title: 'Empleo y trabajo',
    description: 'Información sobre empleo, salarios, trabajo, convocatorias y cambios que afectan a trabajadores.',
    searchTerms: ['empleo', 'trabajo', 'salario', 'sueldos', 'desempleo'],
  },
  {
    slug: 'economia-argentina',
    title: 'Economía argentina',
    description: 'Cobertura y contexto sobre inflación, precios, dólar, actividad económica y finanzas personales.',
    searchTerms: ['inflación', 'precios', 'dólar', 'economía', 'mercados'],
  },
  {
    slug: 'cordoba-y-punilla',
    title: 'Córdoba y Punilla',
    description: 'Noticias y servicios de Córdoba, Villa Carlos Paz, Punilla y localidades de la región.',
    searchTerms: ['Córdoba', 'Punilla', 'Villa Carlos Paz', 'Cosquín'],
  },
];

export function getTopicHub(slug: string) {
  return TOPIC_HUBS.find((topic) => topic.slug === slug);
}

export function getTopicOrFilters(searchTerms: string[]) {
  return searchTerms
    .flatMap((term) => [`ai_title.ilike.%${term}%`, `original_title.ilike.%${term}%`])
    .join(',');
}
