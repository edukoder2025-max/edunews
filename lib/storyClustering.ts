const STOPWORDS = new Set([
  'para', 'como', 'desde', 'entre', 'sobre', 'tras', 'ante', 'esta', 'este', 'estas', 'estos',
  'con', 'del', 'las', 'los', 'una', 'uno', 'por', 'sus', 'que', 'más', 'muy', 'sin', 'según',
  'también', 'fue', 'son', 'hay', 'cada', 'donde', 'cuando', 'hacia', 'qué', 'quien', 'cómo',
]);

function normalize(value: string) {
  return (value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(title: string) {
  return new Set(
    normalize(title)
      .split(' ')
      .filter((token) => token.length >= 4 && !STOPWORDS.has(token)),
  );
}

export function getStoryFingerprint(title: string) {
  return [...getTokens(title)].sort().join('-');
}

/**
 * Detecta títulos que probablemente describen el mismo hecho sin exigir una
 * coincidencia literal. Solo devuelve true con suficientes palabras útiles.
 */
export function isSimilarStory(title: string, knownTitles: string[], threshold = 0.78) {
  const current = getTokens(title);
  if (current.size < 4) return false;

  return knownTitles.some((knownTitle) => {
    const known = getTokens(knownTitle);
    if (known.size < 4) return false;

    let intersection = 0;
    for (const token of current) {
      if (known.has(token)) intersection++;
    }

    const union = new Set([...current, ...known]).size;
    return union > 0 && intersection / union >= threshold;
  });
}
