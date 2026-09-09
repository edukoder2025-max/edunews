export type NewsSource = {
  id: string;
  name: string;
  url: string;
  section: 'Argentina' | 'Mundo' | 'Economía' | 'Tecnología' | 'Ciencia' | 'Cultura' | 'Deportes' | 'General';
  enabled: boolean;
  maxArticlesPerRun: number;
};

/**
 * Registro central de fuentes RSS.
 *
 * Mantener las fuentes como datos permite medirlas, pausarlas individualmente
 * y agregar nuevas sin volver a tocar la lógica de ingestión.
 */
export const NEWS_SOURCES: NewsSource[] = [
  { id: 'bbc-mundo', name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', section: 'Mundo', enabled: true, maxArticlesPerRun: 3 },
  { id: 'elpais', name: 'El País', url: 'https://elpais.com/rss/elpais/portada.xml', section: 'Mundo', enabled: true, maxArticlesPerRun: 3 },
  { id: 'elmundo', name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', section: 'Mundo', enabled: true, maxArticlesPerRun: 3 },
  { id: 'rtve', name: 'RTVE Noticias', url: 'https://www.rtve.es/rss/temas_noticias.xml', section: 'Mundo', enabled: true, maxArticlesPerRun: 3 },
  { id: 'dw-espanol', name: 'DW en Español', url: 'https://rss.dw.com/rdf/rss-es-all', section: 'Mundo', enabled: true, maxArticlesPerRun: 3 },
  { id: 'cnn-espanol', name: 'CNN en Español', url: 'https://cnnespanol.cnn.com/feed/', section: 'Mundo', enabled: true, maxArticlesPerRun: 3 },
  { id: 'pagina12', name: 'Página/12', url: 'https://www.pagina12.com.ar/rss/articulos', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'izquierda-diario', name: 'La Izquierda Diario', url: 'https://www.laizquierdadiario.com/spip.php?page=backend', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'ambito', name: 'Ámbito', url: 'https://www.ambito.com/rss/home.xml', section: 'Economía', enabled: true, maxArticlesPerRun: 3 },
  { id: 'eldiario-es', name: 'elDiario.es', url: 'https://www.eldiario.es/rss/', section: 'Mundo', enabled: true, maxArticlesPerRun: 3 },
  { id: 'eldestape', name: 'El Destape', url: 'https://www.eldestapeweb.com/rss/feed.xml', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'c5n', name: 'C5N', url: 'https://www.c5n.com/rss/c5n.xml', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'tn', name: 'TN', url: 'https://tn.com.ar/rss.xml', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'clarin', name: 'Clarín', url: 'https://www.clarin.com/rss/lo-ultimo/', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'la-nacion', name: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'infobae', name: 'Infobae', url: 'https://www.infobae.com/feeds/rss/', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'el-observador', name: 'El Observador', url: 'https://elobservador.com.ar/rss', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'la-prensa', name: 'La Prensa', url: 'https://www.laprensa.com.ar/Rss.aspx?IdSeccion=14', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'cronista', name: 'El Cronista', url: 'https://www.cronista.com/files/rss/news.xml', section: 'Economía', enabled: true, maxArticlesPerRun: 3 },
  { id: 'libertad-digital', name: 'Libertad Digital', url: 'https://feeds.feedburner.com/libertaddigital/portada', section: 'Mundo', enabled: true, maxArticlesPerRun: 3 },
  { id: 'perfil', name: 'Perfil', url: 'https://www.perfil.com/rss/ultimo-momento', section: 'Argentina', enabled: true, maxArticlesPerRun: 3 },
  { id: 'eleconomista', name: 'El Economista', url: 'https://eleconomista.com.ar/rss/feed.xml', section: 'Economía', enabled: true, maxArticlesPerRun: 3 },
];
