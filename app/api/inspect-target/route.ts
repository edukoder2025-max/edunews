import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from('news_articles')
      .select('id, ai_title, original_title, published_at, category, image_url, source_url')
      .or('ai_title.ilike.%agostina%,original_title.ilike.%agostina%,ai_title.ilike.%glaciares%,original_title.ilike.%glaciares%,ai_title.ilike.%españa%,original_title.ilike.%españa%,ai_title.ilike.%perú%,original_title.ilike.%perú%,ai_title.ilike.%peru%,original_title.ilike.%peru%');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: articles?.length,
      articles
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
