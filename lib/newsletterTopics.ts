export const NEWSLETTER_TOPICS = [
  { value: 'general', label: 'Resumen general', listName: 'Boletín El Irónico', searchTerms: [] },
  { value: 'anses', label: 'ANSES, jubilaciones y pensiones', listName: 'El Irónico — Alertas ANSES', searchTerms: ['anses', 'jubilación', 'jubilaciones', 'pensión', 'pensiones'] },
  { value: 'empleo', label: 'Empleo y trabajo', listName: 'El Irónico — Alertas Empleo', searchTerms: ['empleo', 'trabajo', 'salario', 'sueldos', 'desempleo'] },
  { value: 'economia', label: 'Economía argentina', listName: 'El Irónico — Alertas Economía', searchTerms: ['inflación', 'precios', 'dólar', 'economía', 'mercados'] },
  { value: 'cordoba', label: 'Córdoba y Punilla', listName: 'El Irónico — Alertas Córdoba y Punilla', searchTerms: ['Córdoba', 'Punilla', 'Villa Carlos Paz', 'Cosquín'] },
] as const;

export type NewsletterTopic = (typeof NEWSLETTER_TOPICS)[number]['value'];

export function getNewsletterTopic(value: unknown): (typeof NEWSLETTER_TOPICS)[number] {
  return NEWSLETTER_TOPICS.find((topic) => topic.value === value) || NEWSLETTER_TOPICS[0];
}

export function getNewsletterTopicFilter(searchTerms: readonly string[]) {
  return searchTerms
    .flatMap((term) => [`ai_title.ilike.%${term}%`, `original_title.ilike.%${term}%`])
    .join(',');
}
