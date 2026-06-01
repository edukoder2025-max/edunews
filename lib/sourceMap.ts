export const SOURCE_MAP: Record<string, string> = {
  // Izquierda / oficialismo → buscar en derecha / oposición
  'pagina12.com.ar':  'site:lanacion.com.ar OR site:infobae.com',
  'eldestape.com':    'site:lanacion.com.ar OR site:cronista.com',
  'elcohete.com.ar':  'site:infobae.com OR site:ambito.com',

  // Derecha / oposición → buscar en izquierda / oficialismo
  'lanacion.com.ar':  'site:pagina12.com.ar OR site:eldestape.com',
  'infobae.com':      'site:pagina12.com.ar OR site:elcohete.com.ar',
  'cronista.com':     'site:pagina12.com.ar OR site:ambito.com',

  // Internacional — España
  'elpais.com':       'site:elmundo.es OR site:abc.es',
  'elmundo.es':       'site:elpais.com OR site:eldiario.es',

  // Fallback genérico si la fuente no está mapeada
  'default': '',
};

export function getOppositeSourcesFilter(urlOrDomain: string): string {
  if (!urlOrDomain) return SOURCE_MAP.default;
  
  let domain = urlOrDomain.toLowerCase().trim();
  
  // Extraer el host si es una URL completa
  try {
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      const url = new URL(domain);
      domain = url.hostname;
    }
  } catch (e) {
    // Si falla el parsing, continuar con el texto original
  }
  
  // Limpiar subdominios como 'www.'
  domain = domain.replace(/^www\./, '');
  
  // Encontrar coincidencia exacta o por subcadena
  for (const key of Object.keys(SOURCE_MAP)) {
    if (key !== 'default' && (domain === key || domain.endsWith('.' + key))) {
      return SOURCE_MAP[key];
    }
  }
  
  return SOURCE_MAP.default;
}
