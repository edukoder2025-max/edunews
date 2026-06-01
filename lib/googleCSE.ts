import { getOppositeSourcesFilter } from './sourceMap';

export interface AlternativeSourceResult {
  title: string;
  snippet: string;
  source: string;
  link: string;
}

/**
 * Busca noticias alternativas sobre el mismo tema pero desde perspectivas opuestas
 */
export async function findAlternativeSources(
  title: string,
  originalSourceUrl: string
): Promise<AlternativeSourceResult[]> {
  const apiKey = process.env.GOOGLE_CSE_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    console.warn("Google Custom Search API credentials missing. Falling back to single-source pipeline.");
    return [];
  }

  try {
    // 1. Limpiar el título para generar una query limpia (primeras 6 palabras significativas)
    const cleanTitle = title
      .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2) // excluir palabras muy cortas
      .slice(0, 6)
      .join(' ');

    if (!cleanTitle) return [];

    // 2. Obtener el filtro de sitios opuestos del SOURCE_MAP
    const oppositeFilter = getOppositeSourcesFilter(originalSourceUrl);

    // Si no hay filtro específico para este medio, podemos buscar de forma general
    // o no buscar fuentes alternativas (dependiendo de la preferencia).
    // Buscaremos con el filtro si existe.
    const query = oppositeFilter ? `${cleanTitle} (${oppositeFilter})` : cleanTitle;

    console.log(`[GoogleCSE] Querying for: "${query}"`);

    // 3. Llamar a la API de Google Custom Search
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('cx', cseId);
    url.searchParams.append('q', query);
    url.searchParams.append('num', '3');
    url.searchParams.append('dateRestrict', 'd1'); // Limitar a las últimas 24 horas

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Cachear resultados por 1 hora
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[GoogleCSE] API error: ${res.status} - ${errText}`);
      return [];
    }

    const data = await res.json();

    if (!data.items) {
      console.log(`[GoogleCSE] No alternative sources found for query: "${query}"`);
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.title || '',
      snippet: item.snippet || '',
      source: item.displayLink || '',
      link: item.link || '',
    }));
  } catch (err) {
    console.error("[GoogleCSE] Error fetching alternative sources:", err);
    return [];
  }
}
