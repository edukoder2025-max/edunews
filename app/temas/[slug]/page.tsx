import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { buildArticleUrl } from '@/lib/articleUtils';
import { getSiteUrl } from '@/lib/seoUtils';
import { getTopicHub, getTopicOrFilters } from '@/lib/topicHubs';

export const revalidate = 300;

async function getTopicArticles(slug: string) {
  const topic = getTopicHub(slug);
  if (!topic) return [];

  const { data, error } = await supabase
    .from('news_articles')
    .select('id, ai_title, original_title, ai_content, original_content, category, published_at')
    .or(getTopicOrFilters(topic.searchTerms))
    .order('published_at', { ascending: false })
    .limit(24);

  if (error) {
    console.error('Error cargando tema:', error);
    return [];
  }
  return data || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const topic = getTopicHub(params.slug);
  if (!topic) return { title: 'Tema no encontrado' };

  const canonical = `${getSiteUrl()}/temas/${topic.slug}`;
  return {
    title: `${topic.title} | El Irónico`,
    description: topic.description,
    keywords: topic.searchTerms.join(', '),
    alternates: { canonical },
    openGraph: {
      title: `${topic.title} | El Irónico`,
      description: topic.description,
      url: canonical,
      type: 'website',
    },
  };
}

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const topic = getTopicHub(params.slug);
  if (!topic) notFound();

  const articles = await getTopicArticles(topic.slug);
  const siteUrl = getSiteUrl();
  const topicStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${topic.title} | El Irónico`,
    description: topic.description,
    url: `${siteUrl}/temas/${topic.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'El Irónico', url: siteUrl },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem', position: index + 1,
        url: `${siteUrl}${buildArticleUrl(article.id, article.ai_title || article.original_title || 'Noticia', article.category)}`,
        name: article.ai_title || article.original_title || 'Noticia'
      }))
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(topicStructuredData) }} />
      <Link
        href="/temas"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest"
      >
        <ChevronLeft size={16} /> Volver a temas
      </Link>

      <header className="mt-8 mb-12 border-b border-white/10 pb-8">
        <p className="text-primary text-xs font-black uppercase tracking-[0.25em]">Cobertura temática</p>
        <h1 className="text-4xl md:text-6xl font-black font-serif text-white leading-tight mt-4">{topic.title}</h1>
        <p className="text-lg text-slate-300 leading-relaxed max-w-3xl mt-5">{topic.description}</p>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-10 text-center">
          <p className="text-slate-300 font-bold">Todavía no hay artículos asociados a este tema.</p>
          <p className="text-slate-500 text-sm mt-2">La cobertura aparecerá cuando el sistema detecte información relacionada.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {articles.map((article) => {
            const title = article.ai_title || article.original_title || 'Noticia';
            const excerpt = (article.ai_content || article.original_content || '').replace(/<[^>]*>/g, '').slice(0, 190);
            return (
              <article key={article.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 hover:border-primary/40 transition-colors">
                <p className="text-primary text-[10px] font-black uppercase tracking-widest">{article.category || 'Noticias'}</p>
                <h2 className="text-2xl font-black font-serif text-white leading-tight mt-3">
                  <Link href={buildArticleUrl(article.id, title, article.category)} className="hover:text-primary transition-colors">
                    {title}
                  </Link>
                </h2>
                <p className="text-slate-400 leading-relaxed mt-3">{excerpt}{excerpt ? '…' : ''}</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mt-5">
                  <Calendar size={13} />
                  {article.published_at ? new Date(article.published_at).toLocaleDateString('es-AR') : 'Sin fecha'}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
