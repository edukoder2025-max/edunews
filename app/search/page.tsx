import { supabase } from '@/lib/supabase';
import { buildArticleUrl, getArticleImage } from '@/lib/articleUtils';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { ArrowLeft, Eye, Calendar } from 'lucide-react';

export const revalidate = 60;

interface SearchParams {
  q?: string;
}

interface NewsArticle {
  id: string;
  ai_title: string;
  original_title: string;
  ai_content: string;
  category: string;
  image_url?: string;
  published_at: string;
  views: number;
}

async function searchNews(query: string): Promise<NewsArticle[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const q = query.trim();
  
  // Diccionario de términos comunes sin acento y sus variantes con acento
  const accentDictionary: Record<string, string> = {
    'analisis': 'análisis',
    'america': 'américa',
    'arabe': 'árabe',
    'estado': 'estado',
    'gobierno': 'gobierno',
  };

  try {
    let searchTerms = [q];
    
    // Agregar variantes acentuadas si existen en el diccionario
    if (accentDictionary[q.toLowerCase()]) {
      searchTerms.push(accentDictionary[q.toLowerCase()]);
    }

    let allResults: NewsArticle[] = [];
    const resultIds = new Set<string>();

    for (const term of searchTerms) {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .or(
          `ai_title.ilike.%${term}%,original_title.ilike.%${term}%,ai_content.ilike.%${term}%`
        )
        .order('published_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error(`Error searching "${term}":`, error);
        continue;
      }

      if (data) {
        for (const article of data) {
          if (!resultIds.has(article.id)) {
            resultIds.add(article.id);
            allResults.push(article);
          }
        }
      }

      if (allResults.length >= 30) break;
    }

    return allResults.slice(0, 30);
  } catch (err) {
    console.error("Search exception:", err);
    return [];
  }
}

// Helpers para determinar las clases de color por categoría
function getCategoryColor(category: string) {
  const cat = (category || "").toLowerCase().trim();
  if (cat.includes("mundo")) return "text-cat-mundo border-cat-mundo/20 bg-cat-mundo/10";
  if (cat.includes("argentina")) return "text-cat-argentina border-cat-argentina/20 bg-cat-argentina/10";
  if (cat.includes("tecnolog")) return "text-cat-tecnologia border-cat-tecnologia/20 bg-cat-tecnologia/10";
  if (cat.includes("econom")) return "text-cat-economia border-cat-economia/20 bg-cat-economia/10";
  if (cat.includes("deport")) return "text-cat-deportes border-cat-deportes/20 bg-cat-deportes/10";
  if (cat.includes("ciencia") || cat.includes("cultur") || cat.includes("ciencias")) return "text-cat-cultura border-cat-cultura/20 bg-cat-cultura/10";
  return "text-cat-general border-cat-general/20 bg-cat-general/10";
}

function getCategoryHoverColor(category: string) {
  const cat = (category || "").toLowerCase().trim();
  if (cat.includes("mundo")) return "group-hover:text-cat-mundo";
  if (cat.includes("argentina")) return "group-hover:text-cat-argentina";
  if (cat.includes("tecnolog")) return "group-hover:text-cat-tecnologia";
  if (cat.includes("econom")) return "group-hover:text-cat-economia";
  if (cat.includes("deport")) return "group-hover:text-cat-deportes";
  if (cat.includes("ciencia") || cat.includes("cultur") || cat.includes("ciencias")) return "group-hover:text-cat-cultura";
  return "group-hover:text-primary";
}

function getCategoryFallbackImage(category: string) {
  const cat = (category || "").toLowerCase().trim();
  if (cat.includes("mundo")) return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop";
  if (cat.includes("argentina")) return "https://images.unsplash.com/photo-1545852528-fa22f7f8d17a?q=80&w=800&auto=format&fit=crop";
  if (cat.includes("tecnolog")) return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop";
  if (cat.includes("econom")) return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop";
  if (cat.includes("deport")) return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop";
  if (cat.includes("ciencia") || cat.includes("cultur") || cat.includes("ciencias")) return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams.q || '';
  const results = query ? await searchNews(query) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado de búsqueda */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-4 text-sm font-bold"
        >
          <ArrowLeft size={16} />
          Volver a Portada
        </Link>
        
        <div className="border-newspaper-double py-4 mb-6">
          <h1 className="text-3xl md:text-5xl font-black font-serif italic tracking-tighter text-white mb-2">
            Resultados de Búsqueda
          </h1>
          <p className="text-slate-400 text-lg font-bold">
            {query ? (
              <>
                Buscando: <span className="text-primary font-black">"{query}"</span>
              </>
            ) : (
              "Ingresa un término para buscar"
            )}
          </p>
        </div>

        {/* Contador de resultados */}
        {query && (
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-sm font-bold text-slate-300">
              {results.length === 0
                ? "No se encontraron resultados"
                : `Se encontraron ${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}
            </p>
          </div>
        )}
      </div>

      {/* Grilla de resultados */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((article) => (
            <Link
              key={article.id}
              href={buildArticleUrl(article.id, article.ai_title || article.original_title, article.category)}
              className="group flex flex-col overflow-hidden rounded-xl border border-white/10 hover:border-primary/40 bg-slate-900/30 hover:bg-slate-900/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Imagen */}
              <div className="relative overflow-hidden bg-slate-800 h-48 flex-shrink-0">
                <SafeImage
                  src={getArticleImage(article)}
                  fallbackSrc={getCategoryFallbackImage(article.category)}
                  alt={article.ai_title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Contenido */}
              <div className="flex flex-col flex-1 p-4">
                {/* Badge de categoría */}
                <div className={`inline-flex items-center gap-2 mb-2 w-fit px-2.5 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${getCategoryColor(article.category)}`}>
                  {article.category}
                </div>

                {/* Título */}
                <h3 className={`font-black font-serif italic text-base leading-tight mb-2 line-clamp-3 ${getCategoryHoverColor(article.category)} transition-colors duration-200`}>
                  {article.ai_title}
                </h3>

                {/* Preview de contenido */}
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 flex-1">
                  {article.ai_content?.substring(0, 100)}...
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(article.published_at).toLocaleDateString('es-ES')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    {(article.views || 0).toLocaleString('es-ES')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-white/10">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-black text-white mb-2">Sin resultados</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            No encontramos noticias que coincidan con <span className="text-primary font-bold">"{query}"</span>. Intenta con otros términos.
          </p>
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-white/10">
          <div className="text-6xl mb-4">📰</div>
          <h2 className="text-2xl font-black text-white mb-2">Busca noticias</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Usa el buscador en la barra de navegación para encontrar noticias por tema, categoría o palabras clave.
          </p>
        </div>
      )}
    </div>
  );
}
