import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { buildArticleUrl } from '@/lib/articleUtils';
import { getSiteUrl } from '@/lib/seoUtils';
import { TOPIC_HUBS } from '@/lib/topicHubs';
import { normalizeEditorialCategory } from '@/lib/editorialRules';
import { applyEditorialOverride, shouldRedirectEditorialArticle } from '@/lib/editorialOverrides';

export const revalidate = 300;

const SITEMAP_BATCH_SIZE = 1000;

async function getAllArticlesForSitemap() {
  const articles: Array<{
    id: string;
    published_at: string | null;
    created_at: string | null;
    category: string | null;
    ai_title: string | null;
    original_title: string | null;
  }> = [];

  for (let from = 0; ; from += SITEMAP_BATCH_SIZE) {
    const { data, error } = await supabase
      .from('news_articles')
      .select('id, published_at, created_at, category, ai_title, original_title')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .range(from, from + SITEMAP_BATCH_SIZE - 1);

    if (error) {
      console.error('Error cargando artículos para el sitemap:', error);
      break;
    }

    const batch = data || [];
    articles.push(...batch);

    if (batch.length < SITEMAP_BATCH_SIZE) break;
  }

  return articles;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const articles = await getAllArticlesForSitemap();

  const articleEntries = articles.filter((article) => !shouldRedirectEditorialArticle(article.id)).map((rawArticle) => {
    const article = applyEditorialOverride(rawArticle);
    return {
    url: buildArticleUrl(
      article.id,
      article.ai_title || article.original_title || article.id,
      normalizeEditorialCategory(article.category, article.ai_title || article.original_title),
      baseUrl,
    ),
    lastModified: new Date(article.published_at || article.created_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    ...['mundo', 'argentina', 'tecnologia', 'economia', 'ciencia', 'deportes', 'cultura'].map((category) => ({
      url: `${baseUrl}/categoria/${category}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
    {
      url: `${baseUrl}/temas`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    ...TOPIC_HUBS.map((topic) => ({
      url: `${baseUrl}/temas/${topic.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })),
    ...articleEntries,
  ];
}
