import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getNewsByCategory(category: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .ilike('category', category)
    .order('published_at', { ascending: false })
    .limit(20);
    
  if (error) return [];
  return data || [];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = params.slug;
  const news = await getNewsByCategory(category);

  if (news.length === 0) {
    // Si no hay noticias de esa categoría, podríamos mostrar un mensaje o 404
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Archivo: <span className="text-primary">{category}</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium tracking-widest uppercase text-xs">
          Explorando las últimas novedades en {category}
        </p>
      </header>

      {news.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-slate-400">No hay noticias registradas en esta categoría por el momento.</p>
          <Link href="/" className="text-primary font-bold mt-4 inline-block hover:underline">Volver a la portada</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article) => (
            <article key={article.id} className="group flex flex-col space-y-4">
              <Link href={`/news/${article.id}`} className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 block">
                {article.image_url && (
                  <Image src={article.image_url} alt={article.ai_title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </Link>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight">
                  <Link href={`/news/${article.id}`}>{article.ai_title || article.original_title}</Link>
                </h2>
                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                   {(article.ai_content || article.original_content).replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2">
                  {new Date(article.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
