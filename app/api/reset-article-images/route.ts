import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const forceReset = url.searchParams.get('all') === 'true';

  if (!forceReset) {
    return NextResponse.json(
      {
        success: false,
        message: 'Añade ?all=true para resetear image_url en todos los artículos existentes.',
      },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('news_articles')
    .update({ image_url: null });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Se han reseteado las URLs de imagen de los artículos existentes.',
  });
}
