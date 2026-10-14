export type NewsSource = {
  id: string;
  name: string;
  url: string;
  section: 'Argentina' | 'Mundo' | 'Economía' | 'Tecnología' | 'Ciencia' | 'Cultura' | 'Deportes' | 'General';
  /** Operational ingest remains disabled until permissions are explicitly approved. */
  enabled: boolean;
  maxArticlesPerRun: number;
  /** Endpoint health only; not a rights or publication decision. */
  feedStatus: 'healthy' | 'disabled_pending_recheck';
  feedCheckedAt: string;
  /** Unknown is fail-closed. Perfil terms permit displaying title/link only, not rewriting. */
  rewriteRights: 'approved' | 'unknown' | 'restricted';
};

/**
 * RSS source roster and point-in-time health metadata.
 * A healthy feed does not imply permission to rewrite or publish its material.
 */
export const NEWS_SOURCES: NewsSource[] = [
  { id: 'bbc-mundo', name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', section: 'Mundo', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'elpais', name: 'El País', url: 'https://elpais.com/rss/elpais/portada.xml', section: 'Mundo', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'elmundo', name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', section: 'Mundo', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'rtve', name: 'RTVE Noticias', url: 'https://www.rtve.es/rss/temas_noticias.xml', section: 'Mundo', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'dw-espanol', name: 'DW en Español', url: 'https://rss.dw.com/rdf/rss-es-all', section: 'Mundo', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'cnn-espanol', name: 'CNN en Español', url: 'https://cnnespanol.cnn.com/feed/', section: 'Mundo', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'pagina12', name: 'Página/12', url: 'https://www.pagina12.com.ar/rss/articulos', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'izquierda-diario', name: 'La Izquierda Diario', url: 'https://www.laizquierdadiario.com/spip.php?page=backend', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'ambito', name: 'Ámbito', url: 'https://www.ambito.com/rss/home.xml', section: 'Economía', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'eldiario-es', name: 'elDiario.es', url: 'https://www.eldiario.es/rss/', section: 'Mundo', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'eldestape', name: 'El Destape', url: 'https://www.eldestapeweb.com/rss/feed.xml', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'c5n', name: 'C5N', url: 'https://www.c5n.com/rss/c5n.xml', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'tn', name: 'TN', url: 'https://tn.com.ar/rss.xml', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'clarin', name: 'Clarín', url: 'https://www.clarin.com/rss/lo-ultimo/', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'la-nacion', name: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'infobae', name: 'Infobae', url: 'https://www.infobae.com/feeds/rss/', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'el-observador', name: 'El Observador', url: 'https://elobservador.com.ar/rss', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'la-prensa', name: 'La Prensa', url: 'https://www.laprensa.com.ar/Rss.aspx?IdSeccion=14', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'cronista', name: 'El Cronista', url: 'https://www.cronista.com/arc/outboundfeeds/news/', section: 'Economía', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'libertad-digital', name: 'Libertad Digital', url: 'https://feeds.feedburner.com/libertaddigital/portada', section: 'Mundo', enabled: false, maxArticlesPerRun: 3, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
  { id: 'perfil', name: 'Perfil', url: 'https://www.perfil.com/rss/ultimo-momento', section: 'Argentina', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'restricted' },
  { id: 'eleconomista', name: 'El Economista', url: 'https://eleconomista.com.ar/rss/feed.xml', section: 'Economía', enabled: false, maxArticlesPerRun: 3, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown' },
];
