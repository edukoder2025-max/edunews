export const SOURCE_MAP: Record<string, string> = {
  // Izquierda / oficialismo → buscar en derecha / oposición
  'pagina12.com.ar':    'site:lanacion.com.ar OR site:infobae.com',
  'eldestape.com':      'site:lanacion.com.ar OR site:cronista.com',
  'eldestapeweb.com':   'site:lanacion.com.ar OR site:infobae.com',
  'c5n.com':            'site:lanacion.com.ar OR site:infobae.com',
  'elcohete.com.ar':    'site:infobae.com OR site:ambito.com',

  // Derecha / oposición → buscar en izquierda / oficialismo
  'lanacion.com.ar':    'site:pagina12.com.ar OR site:eldestapeweb.com',
  'infobae.com':        'site:pagina12.com.ar OR site:eldestapeweb.com',
  'cronista.com':       'site:pagina12.com.ar OR site:ambito.com',
  'elobservador.com.ar': 'site:pagina12.com.ar OR site:eldestapeweb.com',
  'laprensa.com.ar':    'site:pagina12.com.ar OR site:eldestapeweb.com',
  'eleconomista.com.ar': 'site:pagina12.com.ar OR site:ambito.com',

  // Internacional — España / Global
  'elpais.com':         'site:elmundo.es OR site:abc.es',
  'elmundo.es':         'site:elpais.com OR site:eldiario.es',
  'dw.com':             'site:rt.com OR site:telesurtv.net',
  'cnn.com':            'site:rt.com OR site:sputniknews.lat',

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
