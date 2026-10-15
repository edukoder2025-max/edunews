import { supabase } from '@/lib/supabase';
import { buildArticleUrl, extractArticleId, getArticleImage } from '@/lib/articleUtils';
import { generateArticleDescription, generateArticleTitle, generateCategoryKeywords } from '@/lib/seoUtils';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { PUBLIC_NEWS_CUTOFF } from '@/lib/publicationVisibility';
import { hasValidEditorialComparison } from '@/lib/editorialComparison';

export const revalidate = 60; // Revalidar para que el corte de archivo se aplique pronto

async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .gte('created_at', PUBLIC_NEWS_CUTOFF)
    .not('published_at', 'is', null)
    .single();

  if (error || !data || !data.ai_title || !data.ai_content || !hasValidEditorialComparison(data.editorial_comparison)) return null;
  return data;
}

// SEO Dinámico: Genera el título y descripción únicos para Google
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const articleId = extractArticleId(params.id);
  const article = await getArticle(articleId);
  if (!article) return { title: 'Noticia no encontrada', robots: { index: false, follow: false } };

  const title = generateArticleTitle(article.ai_title, article.category || 'Análisis editorial');
  const description = generateArticleDescription(
    article.ai_title,
    article.ai_content,
    article.category || ''
  );
  const keywords = generateCategoryKeywords(article.category || 'Análisis editorial');

  return {
    title,
    description,
    keywords: `${keywords}, ${article.ai_title.substring(0, 50)}`,
    openGraph: {
      title: article.ai_title,
      description: `${article.category || 'Análisis editorial'} | Crítica del relato periodístico`,
      type: 'article',
      images: [getArticleImage(article)],
      publishedTime: article.published_at,
      authors: ['El Irónico'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.ai_title,
      description,
      images: [getArticleImage(article)],
    },
  };
}


export default async function LegacyArticleRedirect({ params }: { params: { id: string } }) {
  const articleId = extractArticleId(params.id);
  const article = await getArticle(articleId);

  if (!article) {
    notFound();
  }

  redirect(buildArticleUrl(article.id, article.ai_title, article.category));
}
