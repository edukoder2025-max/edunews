import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 60;

async function getNewsByCategory(category: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .ilike('category', `%${category}%`) // Usamos ilike para ser flexibles con las mayúsculas/minúsculas
    .order('published_at', { ascending: false })
    .limit(12);
    
  if (error) return [];
  return data || [];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryName = decodeURIComponent(params.slug);
  const news = await getNewsByCategory(categoryName);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          Categoría: <span className="text-gradient capitalize">{categoryName}</span>
        </h2>
        <p className="text-slate-400">Mostrando las últimas noticias de {categoryName} reescritas por EduNews IA.</p>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <p className="text-slate-400 text-lg">No hay noticias todavía en esta categoría.</p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">Volver a la portada</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article) => (
            <article 
              key={article.id} 
              className="glass-panel rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 flex flex-col"
            >
              <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                {article.image_url ? (
                  <Image 
                    src={article.image_url} 
                    alt={article.ai_title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600">Sin Imagen</div>
                )}
                <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-[10px] font-black uppercase text-white border border-white/20 shadow-xl">
                  {article.category || 'Noticias'}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-3 text-white leading-tight group-hover:text-primary transition-colors">
                  <Link href={`/news/${article.id}`}>
                    {article.ai_title || article.original_title}
                  </Link>
                </h3>
                <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between gap-4">
                  <Link 
                    href={`/news/${article.id}`}
                    className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-all"
                  >
                    Leer noticia
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
