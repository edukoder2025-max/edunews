import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isValidImageUrl } from '@/lib/articleUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GENERIC_PATTERNS = ['unsplash.com', 'source.unsplash.com', 'images.unsplash.com'];

function isGeneric(url: string | null) {
  if (!url) return true;
  return GENERIC_PATTERNS.some(p => url.includes(p));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'argentina';

  const { data: articles, error } = await supabase
    .from('news_articles')
    .select('id, ai_title, original_title, image_url, source_url, category')
    .ilike('category', `%${category}%`)
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ success: false, error: error.message });

  const results = (articles || []).map(a => {
    const url = a.image_url || '';
    return {
      id: a.id,
      title: (a.ai_title || a.original_title || '').substring(0, 60),
      image_url: url.substring(0, 100),
      is_null: !url,
      is_generic: isGeneric(url),
      passes_validation: isValidImageUrl(url),
      source_url: (a.source_url || '').substring(0, 80),
    };
  });

  const withIssues = results.filter(r => r.is_null || r.is_generic || !r.passes_validation);
  const ok = results.filter(r => !r.is_null && !r.is_generic && r.passes_validation);

  return NextResponse.json({
    category,
    total: results.length,
    ok: ok.length,
    issues: withIssues.length,
    items_with_issues: withIssues,
    items_ok: ok,
  });
}
