import { NextResponse } from 'next/server';
import { fetchRssFeed } from '@/lib/rss';
import { rewriteNews } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Lista robusta de RSS agrupados por categorías (Noticias, Tecnología, Ciencia, Economía, Deportes)
// Balanceamos intencionalmente el espectro ideológico (Izquierda, Derecha, Liberal, Progresista, Centrista, Financiero y Global)
const RSS_FEEDS = [
  // 1. Fuentes Globales / Agencias Neutras
  'https://feeds.bbci.co.uk/mundo/rss.xml', // BBC Mundo (Global Centrista)
  'https://elpais.com/rss/elpais/portada.xml', // El País (España / Centro-Izquierda)
  'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', // El Mundo (España / Centro-Derecha)
  'https://www.rtve.es/rss/temas_noticias.xml', // RTVE Noticias (España / Pública)

  // 2. Argentina: Izquierda / Progresismo / Keynesianismo
  'https://www.pagina12.com.ar/rss/articulos', // Página 12 (Argentina / Izquierda Nacional)
  'https://www.laizquierdadiario.com/spip.php?page=backend', // La Izquierda Diario (Argentina / Socialismo-Marxismo)
  'https://www.ambito.com/rss/home.xml', // Ámbito Financiero (Argentina / Centro-Izquierda Económica)
  'https://www.eldiario.es/rss/', // elDiario.es (España / Progresismo)

  // 3. Argentina: Centro / Derecha / Liberalismo
  'https://tn.com.ar/rss.xml', // TN Noticias (Argentina / Centro-Derecha Comercial)
  'https://www.clarin.com/rss/lo-ultimo/', // Clarín (Argentina / Centro Comercial)
  'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', // La Nación (Argentina / Conservador-Liberal)
  'https://www.infobae.com/feeds/rss/', // Infobae (Argentina / Centro-Derecha Masivo)
  
  // 4. Finanzas / Mercados / Libertarios
  'https://www.cronista.com/files/rss/news.xml', // El Cronista (Argentina / Negocios y Finanzas)
  'https://feeds.feedburner.com/libertaddigital/portada', // Libertad Digital (España-Latam / Liberal-Libertario)
  'https://www.perfil.com/rss/ultimo-momento' // Perfil (Argentina / Centrista Analítico)
];

// Función para desordenar un array (Fisher-Yates)
function shuffleArray(array: string[]) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const loadAll = searchParams.get('all') === 'true';

    // 1. Autolimpieza de la Base de Datos (Evita saturar el plan gratuito de Supabase)
    // Eliminamos de forma automática las noticias que tengan más de 7 días de antigüedad
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { error: pruneError } = await supabase
      .from('news_articles')
      .delete()
      .lt('published_at', sevenDaysAgo.toISOString());
      
    if (pruneError) {
      console.error("Error limpiando base de datos:", pruneError.message);
    }

    let processedCount = 0;
    const errors: string[] = [];
    const debugInfo: any[] = [];

    // Como el cron solo corre 1 vez al día (plan Hobby), procesamos TODOS los feeds
    // Gemini 2.5 Flash gratis permite ~500 req/día + tenemos key de respaldo (~1000 total)
    // 15 feeds × 3 artículos = ~45 llamadas a Gemini (muy lejos del límite)
    const selectedFeeds = RSS_FEEDS; // Siempre procesamos todos los feeds
    const articlesPerFeed = loadAll ? 5 : 3;

    for (const feedUrl of selectedFeeds) {
      const articles = await fetchRssFeed(feedUrl);
      debugInfo.push({ feedUrl, articlesFetched: articles.length });
      
      // Filtramos noticias que tengan menos de 48 horas de antigüedad para frescura total
      const twoDaysAgo = new Date();
      twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

      const freshArticles = articles.filter((a: any) => {
        const pubDate = a.pubDate ? new Date(a.pubDate) : new Date();
        return pubDate > twoDaysAgo;
      });

      // Procesamos la cantidad de noticias configurada
      const topArticles = freshArticles.slice(0, articlesPerFeed);

      for (const article of topArticles) {
        // Verificar si la noticia ya existe por URL o por Título exacto
        const { data: existingArticle } = await supabase
          .from('news_articles')
          .select('id')
          .or(`source_url.eq."${article.link}",original_title.eq."${article.title}"`)
          .maybeSingle();

        if (existingArticle) {
          debugInfo.push({ skipped: article.title, reason: 'Duplicate' });
          continue; 
        }

        // Reescribir con Gemini
        const rewritten = await rewriteNews(article.title, article.content);
        
        if (!rewritten || rewritten.error) {
          errors.push(`Error al reescribir: ${article.title}. Razón: ${rewritten?.error || 'Desconocida'}`);
          continue;
        }

        // Guardar en Supabase
        const { error: dbError } = await supabase
          .from('news_articles')
          .insert({
            original_title: article.title,
            ai_title: rewritten.new_title,
            original_content: article.content,
            ai_content: rewritten.new_content,
            category: rewritten.category || 'General',
            image_url: article.imageUrl,
            source_url: article.link,
            source_name: article.sourceName,
            published_at: article.pubDate ? new Date(article.pubDate) : new Date()
          });

        if (dbError) {
          errors.push(`Error en BD para: ${article.title} - ${dbError.message}`);
        } else {
          processedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Proceso completado. Nuevas noticias agregadas: ${processedCount}`,
      debugInfo,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error("Error general procesando feeds:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
