import { NextResponse } from 'next/server';
import { fetchGoogleIndexingAccessToken, publishIndexingUrl, parseServiceAccount } from '@/lib/googleIndexing';

const rawServiceAccount = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT || process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_BASE64;

function parseEnvServiceAccount() {
  if (!rawServiceAccount) {
    return null;
  }

  let payload = rawServiceAccount;
  if (process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_BASE64 && !process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT) {
    try {
      payload = Buffer.from(process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }
  return parseServiceAccount(payload);
}

export async function POST(request: Request) {
  const serviceAccount = parseEnvServiceAccount();
  if (!serviceAccount) {
    return NextResponse.json(
      {
        error: 'Missing or invalid Google service account. Set GOOGLE_INDEXING_SERVICE_ACCOUNT or GOOGLE_INDEXING_SERVICE_ACCOUNT_BASE64.',
      },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === 'string' ? body.url : process.env.NEXT_PUBLIC_SITE_URL || 'https://elironico.com';
  const type = body.type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';

  if (!url) {
    return NextResponse.json({ error: 'Request body must include a valid "url" string.' }, { status: 400 });
  }

  try {
    const accessToken = await fetchGoogleIndexingAccessToken(JSON.stringify(serviceAccount));
    const result = await publishIndexingUrl(url, type, accessToken);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Indexing API request failed.' },
      { status: 500 }
    );
  }
}
