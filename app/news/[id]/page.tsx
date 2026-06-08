import { supabase } from '@/lib/supabase';
import { buildArticleUrl, extractArticleId, getArticleImage } from '@/lib/articleUtils';
import { generateArticleDescription, generateArticleTitle, generateCategoryKeywords } from '@/lib/seoUtils';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';

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
  const articleId = extractArticleId(params.id);
  const article = await getArticle(articleId);
  if (!article) return { title: 'Noticia no encontrada' };

  const title = generateArticleTitle(article.ai_title || article.original_title, article.category || 'Noticias');
  const description = generateArticleDescription(
    article.ai_title || article.original_title,
    article.ai_content || article.original_content || '',
    article.category || ''
  );
  const keywords = generateCategoryKeywords(article.category || '');

  return {
    title,
    description,
    keywords: `${keywords}, ${(article.ai_title || article.original_title).substring(0, 50)}`,
    openGraph: {
      title: article.ai_title || article.original_title,
      description: `${article.category || 'Noticia'} | Escrita sin sesgos por IA`,
      type: 'article',
      images: [getArticleImage(article)],
      publishedTime: article.published_at,
      authors: ['El Irónico'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.ai_title || article.original_title,
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

  redirect(buildArticleUrl(article.id, article.ai_title || article.original_title, article.category));
}
