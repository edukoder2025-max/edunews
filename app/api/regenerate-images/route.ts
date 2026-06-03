import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchRelevantImage } from '@/lib/imageFetcher';
import { isValidImageUrl } from '@/lib/articleUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Patterns that indicate a generic/irrelevant image we want to replace
const GENERIC_IMAGE_PATTERNS = [
  'unsplash.com',
  'images.unsplash.com',
  'source.unsplash.com',
];

function needsNewImage(url: string | null): boolean {
  if (!url || url.trim() === '') return true;               // null / empty
  if (GENERIC_IMAGE_PATTERNS.some(p => url.includes(p))) return true; // Unsplash generic
  if (!isValidImageUrl(url)) return true;                  // embed / video / invalid
  return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // e.g. "argentina"
    const batchSize = parseInt(searchParams.get('batch') || '30', 10);

    // 1. Fetch articles: those with null/empty OR generic Unsplash images
    let query = supabase
      .from('news_articles')
      .select('id, original_title, ai_title, image_url, source_url, category');

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    const { data: allArticles, error } = await query;
    if (error) throw error;

    // Filter: only articles with missing, invalid or generic images
    const articles = (allArticles || []).filter(a => needsNewImage(a.image_url));

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: category
          ? `No articles in category "${category}" need image regeneration.`
          : 'No articles need image regeneration.',
        updatedCount: 0,
        totalPending: 0,
      });
    }

    let updatedCount = 0;
    let failedCount = 0;
    const updatedArticles = [];
    const failedArticles = [];

    const batch = articles.slice(0, batchSize);

    for (const article of batch) {
      const title = article.ai_title || article.original_title || '';
      const sourceUrl = article.source_url || '';

      try {
        const newImage = await fetchRelevantImage(title, sourceUrl);

        if (newImage && !needsNewImage(newImage) && newImage !== article.image_url) {
          const { error: updateError } = await supabase
            .from('news_articles')
            .update({ image_url: newImage })
            .eq('id', article.id);

          if (!updateError) {
            updatedCount++;
            updatedArticles.push({ id: article.id, title, newImage });
          } else {
            failedCount++;
            failedArticles.push({ id: article.id, title, reason: updateError.message });
          }
        } else {
          // fetchRelevantImage returned a generic/null/invalid image — leave as is for now
          failedCount++;
          failedArticles.push({ id: article.id, title, reason: 'No better image found', current: article.image_url });
        }
      } catch (fetchErr: any) {
        failedCount++;
        failedArticles.push({ id: article.id, title, reason: fetchErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${batch.length} articles. Updated: ${updatedCount}, Failed: ${failedCount}.`,
      totalPending: articles.length,
      remainingAfterBatch: articles.length - batch.length,
      updatedCount,
      failedCount,
      updatedArticles,
      failedArticles,
    });

  } catch (err: any) {
    console.error('Error in regenerate-images:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
