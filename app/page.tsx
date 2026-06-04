import { supabase } from '@/lib/supabase';
import { buildArticleUrl, getArticleImage } from '@/lib/articleUtils';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Calendar, ArrowRight, Eye, ShieldAlert, Cpu } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import ProductsCarousel from '@/components/ProductsCarousel';
import AdSense from '@/components/AdSense';
import { AD_SLOTS } from '@/lib/adSlots';

export const revalidate = 60; // Revalidar la página cada 60 segundos

async function getNews() {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(20);
    
  if (error) {
    console.error("Error cargando noticias:", error);
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


export default async function Home() {
  const news = await getNews();

  if (news.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-white/10">
          <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-slate-300 text-lg font-bold">No hay noticias cargadas en este momento.</p>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Por favor, visita la dirección <code className="bg-slate-900 px-2 py-1 rounded text-primary">/api/fetch-news</code> para cargar información desde los feeds RSS y reescribirlos usando Inteligencia Artificial.
          </p>
          <div className="mt-8">
            <a 
              href="/api/fetch-news" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
            >
              Cargar Noticias Iniciales
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Distribución del contenido:
  const featuredArticle = news[0]; // Destacada Principal (Centro Top)
  const secondaryNews = news.slice(1, 5); // Secundarias (Centro Bottom)
  const quickNews = news.slice(5, 12); // Breves (Columna Izquierda)
  const analysisNews = news.slice(12, 16); // Opinión / Análisis (Columna Derecha)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
          Noticias Argentina sin sesgo y periodismo IA neutral 24/7
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Información verificada y reescrita por IA para lectores exigentes que buscan noticias objetivas, claras y bien fundamentadas.
        </p>
      </section>
      {/* Top Advertisement Banner */}
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
        <div className="mb-8 p-4 bg-slate-900/50 rounded-lg border border-white/5">
          <AdSense 
            slot={AD_SLOTS.HOMEPAGE_TOP} 
            format="auto"
            className="w-full"
          />
        </div>
      )}

      {/* 3-Column Newspaper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= COLUMNA IZQUIERDA (Breves / Última Hora) ================= */}
        <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/5 lg:pr-8 space-y-6">
          <div className="flex items-center justify-between border-b border-primary/20 pb-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping"></span>
              Última Hora
            </h2>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Breves</span>
          </div>

          <div className="divide-y divide-white/5 space-y-5">
            {quickNews.map((article, idx) => {
              const dateStr = new Date(article.published_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <article key={article.id} className="group pt-4 first:pt-0 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-900 text-primary border border-primary/10 font-black px-1.5 py-0.5 rounded">
                      {dateStr}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 border rounded ${getCategoryColor(article.category)}`}>
                      {article.category || 'Mundo'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-tight font-sans">
                    <Link href={buildArticleUrl(article.id, article.ai_title || article.original_title, article.category)}>
                      {article.ai_title || article.original_title}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {(article.ai_content || article.original_content).replace(/<[^>]*>/g, '').substring(0, 80)}...
                  </p>
                </article>
              );
            })}
            
            {quickNews.length === 0 && (
              <p className="text-xs text-slate-500 italic">No hay breves disponibles.</p>
            )}
          </div>
        </aside>

        {/* ================= COLUMNA CENTRAL (Destacado Principal y Grid) ================= */}
        <section className="lg:col-span-6 space-y-12">
          
          {/* Noticia Hero */}
          {featuredArticle && (
            <article className="group space-y-6 pb-8 border-b border-white/5">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/5 group-hover:border-primary/20 shadow-2xl transition-all duration-500">
                <SafeImage 
                  src={getArticleImage(featuredArticle)} 
                  fallbackSrc={getCategoryFallbackImage(featuredArticle.category)}
                  alt={featuredArticle.ai_title || "Destacada"}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                {/* Category Badge absolute */}
                <div className="absolute bottom-4 left-4">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 border rounded-full shadow-lg ${getCategoryColor(featuredArticle.category)}`}>
                    {featuredArticle.category || 'Mundo'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-white font-serif leading-[1.05] tracking-tight group-hover:text-primary transition-colors duration-300">
                  <Link href={buildArticleUrl(featuredArticle.id, featuredArticle.ai_title || featuredArticle.original_title, featuredArticle.category)}>
                    {featuredArticle.ai_title || featuredArticle.original_title}
                  </Link>
                </h2>
                
                <div 
                  className="text-slate-300 text-base leading-relaxed line-clamp-3 font-sans"
                  dangerouslySetInnerHTML={{ __html: featuredArticle.ai_content || featuredArticle.original_content }}
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-500" />
                    {new Date(featuredArticle.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </span>
                  <Link 
                    href={buildArticleUrl(featuredArticle.id, featuredArticle.ai_title || featuredArticle.original_title, featuredArticle.category)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:text-white uppercase tracking-wider transition-colors"
                  >
                    Leer Reporte IA
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Grid de Noticias Secundarias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {secondaryNews.map((article) => (
              <article key={article.id} className="group flex flex-col space-y-4 border-b md:border-b-0 border-white/5 pb-6 md:pb-0">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-white/5 group-hover:border-primary/20 transition-all duration-300">
                  <SafeImage 
                    src={getArticleImage(article)} 
                    fallbackSrc={getCategoryFallbackImage(article.category)}
                    alt={article.ai_title || "Secundaria"}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded ${getCategoryColor(article.category)}`}>
                      {article.category || 'Noticias'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black font-serif text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={buildArticleUrl(article.id, article.ai_title || article.original_title, article.category)}>
                        {article.ai_title || article.original_title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans line-clamp-3 leading-relaxed">
                      {(article.ai_content || article.original_content).replace(/<[^>]*>/g, '').substring(0, 120)}...
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    <span>
                      {new Date(article.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                    <Link href={buildArticleUrl(article.id, article.ai_title || article.original_title, article.category)} className="text-primary hover:text-white transition-colors">
                      Leer más +
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </section>

        {/* ================= COLUMNA DERECHA (AI Neutralizer stats & opinión) ================= */}
        <aside className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-white/5 lg:pl-8 space-y-8">
          
          {/* Panel Explicativo del Motor de IA */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-5 border border-primary/20 relative overflow-hidden group shadow-lg">
            {/* Ambient light glow */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <Cpu size={14} className="animate-pulse" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  El Irónico AI Engine
                </h3>
              </div>
              
              <h4 className="text-base font-black font-serif text-white leading-snug">
                Periodismo Libre de Sesgo Partidario
              </h4>
              
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Este portal procesa automáticamente noticias de diversas fuentes, aplicando Inteligencia Artificial con <strong>Gemini 2.5 Flash</strong> para neutralizar el lenguaje sesgado, eliminar clickbaits y estructurar la información con total objetividad y transparencia.
              </p>

              {/* Stats panel */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="space-y-0.5 border-r border-white/5">
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Sesgo Reducido</div>
                  <div className="text-base font-black text-secondary">95.8%</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[9px] text-slate-500 font-bold uppercase">Procesamiento</div>
                  <div className="text-base font-black text-primary">100% IA</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={10} className="text-primary animate-spin" />
                  Verificación de Neutralidad Activa
                </span>
              </div>
            </div>
          </div>

          <ProductsCarousel />

          {/* Sección de Análisis Profundo / Opinión */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                Análisis de Fondo
              </h2>
              <span className="text-[9px] text-slate-500 font-bold uppercase">Opinión</span>
            </div>

            <div className="space-y-6">
              {analysisNews.map((article) => (
                <article key={article.id} className="group space-y-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded ${getCategoryColor(article.category)}`}>
                    {article.category || 'Mundo'}
                  </span>
                  <h3 className="text-sm font-black font-serif text-white leading-tight group-hover:text-primary transition-colors">
                    <Link href={buildArticleUrl(article.id, article.ai_title || article.original_title, article.category)}>
                      {article.ai_title || article.original_title}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans line-clamp-3 leading-relaxed">
                    {(article.ai_content || article.original_content).replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[9px] text-slate-500 font-medium">
                    <span className="italic">Redacción El Irónico</span>
                    <span>{new Date(article.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </article>
              ))}
              
              {analysisNews.length === 0 && (
                <p className="text-xs text-slate-500 italic">No hay análisis en esta edición.</p>
              )}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
