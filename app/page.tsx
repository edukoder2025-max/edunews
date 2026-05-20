import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import WeatherWidget from '@/components/WeatherWidget';

export const revalidate = 60; // Revalidar la página cada 60 segundos

async function getNews() {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(19);
    
  if (error) {
    console.error("Error cargando noticias:", error);
    return [];
  }
  return data || [];
}

export default async function Home() {
  const news = await getNews();

  const featuredArticle = news[0];
  const otherNews = news.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Portada Header */}
      <div className="border-b-2 border-white/10 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 italic">
            Edu<span className="text-primary">News</span>
          </h2>
          <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">
            Periodismo Ético • Inteligencia Artificial • {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2 text-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            En Vivo
          </div>
          <span className="text-slate-500">|</span>
          <WeatherWidget />
        </div>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border-dashed border-white/10">
          <p className="text-slate-400 text-lg">No hay noticias todavía. Ejecuta el endpoint /api/fetch-news para cargar información.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Noticia Destacada (Hero) */}
          {featuredArticle && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-16">
              <div className="lg:col-span-8 group overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative aspect-[16/9]">
                {featuredArticle.image_url && (
                  <Image 
                    src={featuredArticle.image_url} 
                    alt={featuredArticle.ai_title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-6 left-6 right-6">
                   <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 inline-block">
                    {featuredArticle.category || 'Mundo'}
                  </span>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <h3 className="text-3xl md:text-5xl font-black text-white leading-[1.1] hover:text-primary transition-colors cursor-pointer">
                  <Link href={`/news/${featuredArticle.id}`}>
                    {featuredArticle.ai_title || featuredArticle.original_title}
                  </Link>
                </h3>
                <div 
                  className="text-slate-400 text-lg leading-relaxed line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: featuredArticle.ai_content || featuredArticle.original_content }}
                />
                <Link 
                  href={`/news/${featuredArticle.id}`}
                  className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs border-b-2 border-primary pb-1 hover:text-primary transition-all"
                >
                  Leer Artículo Completo
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            </section>
          )}

          {/* Grid de Noticias Secundarias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {otherNews.map((article) => (
              <article key={article.id} className="flex flex-col group border-b border-white/5 pb-8 last:border-0 md:pb-0 md:border-0">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-6 border border-white/10 group-hover:border-primary/30 transition-all">
                  {article.image_url ? (
                    <Image 
                      src={article.image_url} 
                      alt={article.ai_title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600 text-xs uppercase font-bold">Sin Imagen</div>
                  )}
                  <div className="absolute top-3 left-3 bg-white text-black px-2 py-0.5 rounded text-[9px] font-black uppercase">
                    {article.category || 'Noticias'}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-black text-white leading-tight group-hover:text-primary transition-colors">
                    <Link href={`/news/${article.id}`}>
                      {article.ai_title || article.original_title}
                    </Link>
                  </h4>
                  <div 
                    className="text-slate-400 text-sm line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.ai_content || article.original_content }}
                  />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(article.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                    <Link href={`/news/${article.id}`} className="text-xs font-black text-primary uppercase tracking-tighter hover:text-white transition-colors">
                      Leer más +
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
