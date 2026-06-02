import { supabase } from '@/lib/supabase';
import { buildArticleUrl, extractArticleId, getArticleImage } from '@/lib/articleUtils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ShareButtons from '@/components/ShareButtons';
import AiTransparencyPanel from '@/components/AiTransparencyPanel';
import { Calendar, ChevronLeft, Shield, Eye, Flame, Compass } from 'lucide-react';
import SafeImage from '@/components/SafeImage';

export const revalidate = 3600; // Revalidar cada hora

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

// SEO Dinámico: Genera el título y descripción únicos para Google
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const articleId = extractArticleId(params.id);
  const article = await getArticle(articleId);
  if (!article) return { title: 'Noticia no encontrada' };

  const cleanText = (article.ai_content || article.original_content || '')
    .substring(0, 160)
    .replace(/<[^>]*>/g, '') + '...';

  return {
    title: `${article.ai_title || article.original_title} | EduNews`,
    description: cleanText,
    openGraph: {
      title: article.ai_title || article.original_title,
      description: 'Periodismo Ético e Independiente impulsado por Inteligencia Artificial.',
      images: [getArticleImage(article)],
    },
  };
}

async function getRelatedArticles(category: string, currentId: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('id, ai_title, original_title, image_url, published_at, category')
    .ilike('category', category)
    .neq('id', currentId)
    .order('published_at', { ascending: false })
    .limit(4);

  if (error) return [];
  return data || [];
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

// Helper para determinar el color de categoría
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

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const articleId = extractArticleId(params.id);
  const article = await getArticle(articleId);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.category || '', article.id);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ================= COLUMNA PRINCIPAL (ARTÍCULO) ================= */}
        <article className="lg:col-span-8 space-y-8">
          
          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wider">
              <span className={`px-3 py-1 border rounded-full ${getCategoryColor(article.category)}`}>
                {article.category || 'Mundo'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Redacción EduNews</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(article.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-serif text-white leading-[1.05] tracking-tight">
              {article.ai_title || article.original_title}
            </h1>
            
            {article.source_name && (
              <p className="text-xs text-slate-500 font-medium">
                Fuente original: <span className="text-slate-300 font-bold">{article.source_name}</span> (extraído automáticamente vía RSS)
              </p>
            )}
          </header>

          {/* Social Share Buttons */}
          <ShareButtons
            url={`https://ultimo-news2026.vercel.app${buildArticleUrl(article.id, article.ai_title || article.original_title)}`}
            title={article.ai_title || article.original_title}
          />

          {/* Image */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <SafeImage
              src={getArticleImage(article)}
              fallbackSrc={getCategoryFallbackImage(article.category)}
              alt={article.ai_title || "Imagen del artículo"}
              className="object-cover w-full h-full"
              loading="eager"
            />
          </div>

          {/* Interactive AI Transparency Panel */}
          <AiTransparencyPanel
            aiTitle={article.ai_title || article.original_title}
            originalTitle={article.original_title}
            aiContent={article.ai_content || article.original_content}
            originalContent={article.original_content}
            sourceName={article.source_name || "RSS Feed"}
            sourceUrl={article.source_url || ""}
            category={article.category || "General"}
            biasDetected={article.bias_detected}
            biasScore={article.bias_score}
            sourcesUsed={article.sources_used}
          />

          {/* Related Articles in footer of column */}
          <footer className="mt-16 pt-10 border-t border-white/10 space-y-6">
            <h3 className="text-xl font-black font-serif text-white uppercase tracking-tight flex items-center gap-2">
              <Compass size={18} className="text-primary" />
              Noticias Relacionadas
            </h3>
            
            {relatedArticles.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No se encontraron artículos similares.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedArticles.map(rel => (
                  <Link key={rel.id} href={buildArticleUrl(rel.id, rel.ai_title || rel.original_title)} className="group block space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 group-hover:border-primary/20 transition-all duration-300">
                      <SafeImage 
                        src={getArticleImage(rel)} 
                        fallbackSrc={getCategoryFallbackImage(rel.category)}
                        alt={rel.ai_title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded ${getCategoryColor(rel.category)}`}>
                        {rel.category || 'Mundo'}
                      </span>
                      <h4 className="text-base font-bold font-serif text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {rel.ai_title || rel.original_title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </footer>
        </article>

        {/* ================= COLUMNA SECUNDARIA (SIDEBAR) ================= */}
        <aside className="lg:col-span-4 space-y-10">
          <div className="sticky top-28 space-y-10">
            
            {/* AI Policy Card */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Shield size={16} className="text-secondary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Código Ético EduNews</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Garantizamos que todos nuestros artículos se generan reescribiendo fuentes legítimas mediante inteligencia artificial con el único fin de eliminar calificativos partidistas, manipulaciones emocionales o titulares engañosos.
              </p>
              <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <Eye size={12} />
                Auditoría pública en pestaña de transparencia
              </div>
            </div>

            {/* Category Spotlights (Same category items) */}
            {relatedArticles.length > 0 && (
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3 flex items-center gap-2">
                  <Flame size={14} className="text-primary animate-pulse" />
                  Destacados de {article.category}
                </h3>
                <div className="space-y-4">
                  {relatedArticles.slice(0, 3).map(rel => (
                    <Link key={rel.id} href={buildArticleUrl(rel.id, rel.ai_title || rel.original_title)} className="flex gap-4 group">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                        <SafeImage 
                          src={getArticleImage(rel)} 
                          fallbackSrc={getCategoryFallbackImage(rel.category)}
                          alt={rel.ai_title} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="text-xs font-bold font-serif text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {rel.ai_title || rel.original_title}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          {new Date(rel.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar Ad Placeholder (AdSense compatible styling) */}
            <div className="w-full bg-slate-950/60 border border-white/5 rounded-2xl p-6 text-center space-y-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block">Publicidad</span>
              <div className="w-full h-48 bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Espacio AdSense</span>
                <span className="text-[9px] text-slate-600 mt-1 font-medium leading-relaxed italic">Anuncio recomendado adaptado al lector</span>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
