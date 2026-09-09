const RESULT_SERIES_TERMS = [
  'quiniela',
  'lotería',
  'loteria',
  'resultados de la tómbola',
  'resultados de la tombola',
];

/** Corrige clasificaciones obvias sin alterar la información original del artículo. */
export function normalizeEditorialCategory(category: string | null | undefined, title: string | null | undefined) {
  const normalizedCategory = (category || '').trim();
  const normalizedTitle = (title || '').toLowerCase();

  if (RESULT_SERIES_TERMS.some((term) => normalizedTitle.includes(term))) {
    return 'Argentina';
  }

  return normalizedCategory || 'General';
}

export function isRecurringResultsStory(title: string | null | undefined) {
  const normalizedTitle = (title || '').toLowerCase();
  return RESULT_SERIES_TERMS.some((term) => normalizedTitle.includes(term));
}
