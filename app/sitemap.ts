import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { buildArticleUrl } from '@/lib/articleUtils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elironico.com';

  // Obtener todas las noticias para el sitemap
  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, published_at, category, ai_title, original_title')
    .order('published_at', { ascending: false })
    .limit(1000);

  const articleEntries = (articles || []).map((article) => ({
    url: buildArticleUrl(article.id, article.ai_title || article.original_title || article.id, article.category, baseUrl),
    lastModified: new Date(article.published_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/categoria/mundo`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categoria/argentina`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categoria/tecnologia`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categoria/economia`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categoria/ciencia`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categoria/deportes`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categoria/cultura`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    ...articleEntries,
  ];
}
