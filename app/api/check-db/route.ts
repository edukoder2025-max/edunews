import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from('news_articles')
      .select('id, ai_title, original_title, published_at, category, image_url, source_url')
      .order('published_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: articles?.length,
      articles: articles?.slice(0, 15)
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
