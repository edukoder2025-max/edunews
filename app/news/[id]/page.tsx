import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Espacio para Anuncio Superior (Header Ad) */}
      <div className="w-full h-24 bg-white/5 border border-white/10 rounded-xl mb-12 flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest overflow-hidden">
        <span className="opacity-50">[ Espacio para Publicidad - Header Banner ]</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Columna Principal (Noticia) */}
        <article className="lg:col-span-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 group text-sm font-bold uppercase tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
            Volver a la portada
          </Link>

          <header className="space-y-6 mb-12">
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tighter">
              <span className="bg-primary text-white px-3 py-1 rounded shadow-lg shadow-primary/20">
                {article.category || 'Mundo'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">EduNews Redacción</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{new Date(article.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tighter">
              {article.ai_title || article.original_title}
            </h1>

            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border-l-4 border-primary">
              <p className="text-slate-300 text-sm italic leading-relaxed">
                "Este artículo ha sido procesado mediante Inteligencia Artificial bajo la supervisión editorial de EduNews, garantizando una perspectiva neutral, profunda y libre de sesgos políticos."
              </p>
            </div>
          </header>

          {article.image_url && (
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl">
              <Image 
                src={article.image_url} 
                alt={article.ai_title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>
          )}

          {/* Espacio para Anuncio en medio del contenido */}
          <div className="my-10 w-full h-64 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest">
            <span className="opacity-50">[ Espacio para Publicidad - In-Feed ]</span>
          </div>

          <div 
            className="prose prose-invert prose-lg max-w-none 
              prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter
              prose-p:text-slate-300 prose-p:leading-[1.8] prose-p:mb-10
              prose-strong:text-white prose-strong:font-black
              prose-blockquote:border-primary prose-blockquote:bg-white/5 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic
              prose-h2:text-3xl prose-h2:mt-20 prose-h2:mb-10 prose-h2:text-primary prose-h2:border-b prose-h2:border-primary/20 prose-h2:pb-4
              prose-a:text-primary hover:prose-a:text-white transition-colors"
            dangerouslySetInnerHTML={{ __html: article.ai_content || article.original_content }}
          />

          <footer className="mt-16 pt-8 border-t border-white/10">
            <div className="p-8 bg-white/5 rounded-3xl space-y-4">
              <h4 className="text-white font-black text-xl uppercase tracking-tighter">Referencia Informativa</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                EduNews mantiene un compromiso con la transparencia. Para la elaboración de esta pieza editorial exclusiva, se ha tomado como referencia la información proporcionada originalmente por <strong>{article.source_name}</strong>.
              </p>
            </div>
          </footer>
        </article>

        {/* Sidebar (Publicidad y Más Noticias) */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Anuncio Sidebar */}
          <div className="w-full h-[600px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest sticky top-32">
            <div className="text-center px-8 space-y-4">
              <span className="opacity-50">Espacio para Publicidad<br/>(Skyscraper / Sidebar Ad)</span>
              <div className="w-full h-px bg-white/10"></div>
              <p className="text-[10px] text-slate-500 font-medium normal-case italic">Este espacio está reservado para Google AdSense una vez aprobada la cuenta.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
