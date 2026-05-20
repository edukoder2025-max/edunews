import { NextResponse } from 'next/server';
import { fetchRssFeed } from '@/lib/rss';
import { rewriteNews } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Lista robusta de RSS agrupados por categorías (Noticias, Tecnología, Ciencia, Economía, Deportes)
const RSS_FEEDS = [
  'https://feeds.bbci.co.uk/mundo/rss.xml', // BBC Mundo
  'https://elpais.com/rss/elpais/portada.xml', // El País
  'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', // El Mundo
  'https://www.rtve.es/rss/temas_noticias.xml', // RTVE Noticias
  'https://tn.com.ar/rss.xml', // TN (Argentina - Muy estable)
  'https://www.clarin.com/rss/lo-ultimo/', // Clarín (Argentina)
  'https://www.perfil.com/rss/ultimo-momento', // Perfil (Argentina)
  'https://www.pagina12.com.ar/rss/articulos' // Página 12 (Argentina)
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

    // Si loadAll es true, procesamos todos los feeds; si no, tomamos 3 al azar para no saturar
    const selectedFeeds = loadAll ? RSS_FEEDS : shuffleArray(RSS_FEEDS).slice(0, 3);
    const articlesPerFeed = loadAll ? 4 : 2;

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
