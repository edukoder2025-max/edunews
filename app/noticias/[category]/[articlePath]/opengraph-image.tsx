import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';
import { extractArticleId } from '@/lib/articleUtils';
import { PUBLIC_NEWS_CUTOFF } from '@/lib/publicationVisibility';
import { hasValidEditorialComparison } from '@/lib/editorialComparison';

export const runtime = 'edge';
export const revalidate = 60;
export const alt = 'Artículo de El Irónico';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({
  params,
}: {
  params: { category: string; articlePath: string };
}) {
  const articleId = extractArticleId(params.articlePath);
  const { data: article } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', articleId)
    .gte('created_at', PUBLIC_NEWS_CUTOFF)
    .not('published_at', 'is', null)
    .single();

  const isPublishable = Boolean(article?.ai_title && article?.ai_content && hasValidEditorialComparison(article?.editorial_comparison));
  const title = isPublishable ? article!.ai_title : 'El Irónico · lectura crítica del periodismo';
  const category = isPublishable ? article!.category || 'Análisis editorial' : 'ANÁLISIS EDITORIAL';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#101820',
          color: '#f8fafc',
          padding: '62px 72px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '4px solid #d97745',
            paddingBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 800, letterSpacing: 3 }}>
            EL IRÓNICO
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#d97745', fontWeight: 700 }}>
            {category.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '1050px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, color: '#cbd5e1' }}>
            Crítica del relato periodístico
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 58,
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            {title.length > 145 ? `${title.substring(0, 142)}...` : title}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>
          elironico.com
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
