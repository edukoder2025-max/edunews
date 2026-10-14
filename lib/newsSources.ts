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
  /** Publisher group must be reviewed before treating feeds as independent evidence. */
  independenceGroup: string;
};

/**
 * RSS source roster and point-in-time health metadata.
 * A healthy feed does not imply permission to rewrite or publish its material.
 */
export const NEWS_SOURCES: NewsSource[] = [
  { id: 'bbc-mundo', name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', section: 'Mundo', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'elpais', name: 'El País', url: 'https://elpais.com/rss/elpais/portada.xml', section: 'Mundo', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'elmundo', name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', section: 'Mundo', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'rtve', name: 'RTVE Noticias', url: 'https://www.rtve.es/rss/temas_noticias.xml', section: 'Mundo', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'dw-espanol', name: 'DW en Español', url: 'https://rss.dw.com/rdf/rss-es-all', section: 'Mundo', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'cnn-espanol', name: 'CNN en Español', url: 'https://cnnespanol.cnn.com/feed/', section: 'Mundo', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'pagina12', name: 'Página/12', url: 'https://www.pagina12.com.ar/rss/articulos', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'izquierda-diario', name: 'La Izquierda Diario', url: 'https://www.laizquierdadiario.com/spip.php?page=backend', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'ambito', name: 'Ámbito', url: 'https://www.ambito.com/rss/home.xml', section: 'Economía', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'eldiario-es', name: 'elDiario.es', url: 'https://www.eldiario.es/rss/', section: 'Mundo', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'eldestape', name: 'El Destape', url: 'https://www.eldestapeweb.com/rss/feed.xml', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'c5n', name: 'C5N', url: 'https://www.c5n.com/rss/c5n.xml', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'tn', name: 'TN', url: 'https://tn.com.ar/arc/outboundfeeds/google-news-feed/?outputType=xml', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'clarin', name: 'Clarín', url: 'https://www.clarin.com/rss/lo-ultimo/', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'la-nacion', name: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'infobae', name: 'Infobae', url: 'https://www.infobae.com/feeds/rss/', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'el-observador', name: 'El Observador', url: 'https://elobservador.com.ar/rss', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'la-prensa', name: 'La Prensa', url: 'https://www.laprensa.com.ar/Rss.aspx?IdSeccion=14', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'cronista', name: 'El Cronista', url: 'https://www.cronista.com/arc/outboundfeeds/news/', section: 'Economía', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'libertad-digital', name: 'Libertad Digital', url: 'https://feeds.feedburner.com/libertaddigital/portada', section: 'Mundo', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
  { id: 'perfil', name: 'Perfil', url: 'https://www.perfil.com/rss/ultimo-momento', section: 'Argentina', enabled: false, maxArticlesPerRun: 1, feedStatus: 'disabled_pending_recheck', feedCheckedAt: '2026-10-14', rewriteRights: 'restricted', independenceGroup: 'unreviewed' },
  { id: 'eleconomista', name: 'El Economista', url: 'https://eleconomista.com.ar/ultimas-noticias/feed/', section: 'Economía', enabled: false, maxArticlesPerRun: 1, feedStatus: 'healthy', feedCheckedAt: '2026-10-14', rewriteRights: 'unknown', independenceGroup: 'unreviewed' },
];
