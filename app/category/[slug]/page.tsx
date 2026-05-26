import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, FolderOpen, Calendar, ArrowRight } from 'lucide-react';

export const revalidate = 60;

async function getNewsByCategory(category: string) {
  // Manejar búsquedas robustas para categorías acentuadas
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .ilike('category', category)
    .order('published_at', { ascending: false })
    .limit(24);
    
  if (error) {
    console.error("Error fetching category news:", error);
    return [];
  }
  return data || [];
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

// Fallback de imágenes en alta definición de Unsplash organizadas por categoría
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

function getCategoryTextClass(category: string) {
  const cat = (category || "").toLowerCase().trim();
  if (cat.includes("mundo")) return "text-cat-mundo";
  if (cat.includes("argentina")) return "text-cat-argentina";
  if (cat.includes("tecnolog")) return "text-cat-tecnologia";
  if (cat.includes("econom")) return "text-cat-economia";
  if (cat.includes("deport")) return "text-cat-deportes";
  if (cat.includes("ciencia") || cat.includes("cultur") || cat.includes("ciencias")) return "text-cat-cultura";
  return "text-primary";
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const rawCategory = params.slug;
  const category = decodeURIComponent(rawCategory);
  const news = await getNewsByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Volver a la portada */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group text-xs font-black uppercase tracking-widest"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver a la portada
        </Link>
      </div>

      {/* Header de Categoría */}
      <header className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight uppercase flex items-center gap-3">
            <FolderOpen className={getCategoryTextClass(category)} size={36} />
            Sección: <span className={getCategoryTextClass(category)}>{category}</span>
          </h1>
          <p className="text-slate-400 mt-2 font-semibold tracking-wider uppercase text-xs">
            Artículos y reportes de prensa neutralizados de la categoría {category}
          </p>
        </div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
          Total de Reportes: {news.length}
        </div>
      </header>

      {/* Cuadrícula de Artículos */}
      {news.length === 0 ? (
        <div className="text-center py-20 bg-slate-950/40 rounded-3xl border border-dashed border-white/10">
          <FolderOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-bold">No hay noticias en esta sección todavía.</p>
          <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
            El lector de feeds RSS no ha indexado ni reescrito noticias correspondientes a la sección de "{category}" recientemente.
          </p>
          <Link 
            href="/" 
            className="text-xs font-black uppercase tracking-widest text-primary hover:text-white mt-6 inline-flex items-center gap-1.5 transition-colors"
          >
            Volver a la Portada
            <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {news.map((article) => (
            <article key={article.id} className="group flex flex-col space-y-4">
              <Link 
                href={`/news/${article.id}`} 
                className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 group-hover:border-primary/20 block shadow-lg transition-all duration-300"
              >
                <img 
                  src={article.image_url || getCategoryFallbackImage(article.category)} 
                  alt={article.ai_title || "Noticia"} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                <div className="absolute top-3 left-3">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded shadow-md ${getCategoryColor(article.category)}`}>
                    {article.category || 'Mundo'}
                  </span>
                </div>
              </Link>
              
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-black font-serif text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    <Link href={`/news/${article.id}`}>
                      {article.ai_title || article.original_title}
                    </Link>
                  </h2>
                  <p className="text-xs text-slate-400 font-sans line-clamp-3 leading-relaxed">
                    {(article.ai_content || article.original_content).replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(article.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </span>
                  <Link 
                    href={`/news/${article.id}`} 
                    className="text-primary hover:text-white transition-colors"
                  >
                    Leer Reporte IA +
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
