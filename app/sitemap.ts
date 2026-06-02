import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { buildArticleUrl } from '@/lib/articleUtils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Obtener todas las noticias para el sitemap
  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, published_at, ai_title, original_title')
    .order('published_at', { ascending: false })
    .limit(1000);

  const articleEntries = (articles || []).map((article) => ({
    url: buildArticleUrl(article.id, article.ai_title || article.original_title || article.id, baseUrl),
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
      url: `${baseUrl}/category/Mundo`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/Argentina`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/Tecnología`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/Economía`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/Ciencia`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/Deportes`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/Cultura`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    ...articleEntries,
  ];
}
