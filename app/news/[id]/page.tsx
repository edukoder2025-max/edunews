import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ShareButtons from '@/components/ShareButtons';

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
  const article = await getArticle(params.id);
  if (!article) return { title: 'Noticia no encontrada' };

  return {
    title: `${article.ai_title} | EduNews`,
    description: article.ai_content?.substring(0, 160).replace(/<[^>]*>/g, '') + '...',
    openGraph: {
      title: article.ai_title,
      description: 'Periodismo Ético e Independiente impulsado por IA.',
      images: [article.image_url || ''],
    },
  };
}

async function getRelatedArticles(category: string, currentId: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('id, ai_title, original_title, image_url, published_at, category')
    .eq('category', category)
    .neq('id', currentId)
    .order('published_at', { ascending: false })
    .limit(4);
    
  if (error) return [];
  return data || [];
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.category || '', article.id);

  const formatContent = (content: string) => {
    if (!content) return '';
    if (content.includes('<p>')) {
      return content.replace(/<p>/g, '<p class="mb-10">');
    }
    return content
      .split(/\n+/)
      .map(para => para.trim())
      .filter(para => para.length > 0)
      .map(para => `<p class="mb-10">${para}</p>`)
      .join('');
  };

  const formattedContent = formatContent(article.ai_content || article.original_content);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Ad */}
      <div className="w-full h-24 bg-white/5 border border-white/10 rounded-xl mb-12 flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest overflow-hidden">
        <span className="opacity-50">[ Espacio para Publicidad - Header Banner ]</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
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
          </header>
          
          <ShareButtons 
            url={`https://edunews-alpha.vercel.app/news/${article.id}`} 
            title={article.ai_title || article.original_title} 
          />

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

          <div 
            className="prose prose-invert prose-lg max-w-none 
              prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter
              prose-p:text-slate-300 prose-p:leading-[1.9] prose-p:mb-12
              prose-strong:text-white prose-strong:font-black
              prose-blockquote:border-primary prose-blockquote:bg-white/5 prose-blockquote:py-6 prose-blockquote:px-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:my-16
              prose-h2:text-3xl prose-h2:mt-24 prose-h2:mb-12 prose-h2:text-primary prose-h2:border-b prose-h2:border-primary/20 prose-h2:pb-6"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />

          <footer className="mt-16 pt-12 border-t border-white/10">
             <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">Noticias Relacionadas</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedArticles.map(rel => (
                  <Link key={rel.id} href={`/news/${rel.id}`} className="group block space-y-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                      <Image src={rel.image_url || ''} alt={rel.ai_title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-tight">
                      {rel.ai_title || rel.original_title}
                    </h4>
                  </Link>
                ))}
             </div>
          </footer>
        </article>

        <aside className="lg:col-span-4 space-y-12">
          <div className="sticky top-32 space-y-12">
            {/* Sección "También te puede interesar" en Sidebar */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter border-b border-primary/20 pb-4">Destacados de {article.category}</h3>
              <div className="space-y-6">
                {relatedArticles.slice(0, 3).map(rel => (
                  <Link key={rel.id} href={`/news/${rel.id}`} className="flex gap-4 group">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                      <Image src={rel.image_url || ''} alt={rel.ai_title} fill className="object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {rel.ai_title || rel.original_title}
                      </h4>
                      <p className="text-[10px] text-slate-500 uppercase font-black">
                        {new Date(rel.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Ad */}
            <div className="w-full h-[600px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest">
              <div className="text-center px-8 space-y-4">
                <span className="opacity-50">Publicidad</span>
                <div className="w-full h-px bg-white/10"></div>
                <p className="text-[10px] text-slate-500 font-medium normal-case italic">Espacio disponible para AdSense</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
