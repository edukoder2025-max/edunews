import { NextResponse } from 'next/server';
import { submitSitemapToSearchConsole } from '@/lib/googleSearchConsole';
import { fetchGoogleAccessToken, parseServiceAccount } from '@/lib/googleIndexing';

const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://elironico.com';
const sitemapUrl = `${siteUrl.replace(/\/$/, '')}/sitemap.xml`;
const rawServiceAccount =
  process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT || process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_BASE64 ||
  process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT || process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_BASE64;

function parseEnvServiceAccount() {
  if (!rawServiceAccount) {
    return null;
  }

  let payload = rawServiceAccount;
  if (process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_BASE64 && !process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT) {
    try {
      payload = Buffer.from(process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }

  if (process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_BASE64 && !process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT && !process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT) {
    try {
      payload = Buffer.from(process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }

  return parseServiceAccount(payload);
}

export async function GET() {
  const serviceAccount = parseEnvServiceAccount();
  if (!serviceAccount) {
    return NextResponse.json(
      {
        error:
          'Missing or invalid Google Search Console service account. Set GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT or GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_BASE64, or reuse GOOGLE_INDEXING_SERVICE_ACCOUNT.',
      },
      { status: 400 }
    );
  }

  try {
    const accessToken = await fetchGoogleAccessToken(JSON.stringify(serviceAccount), 'https://www.googleapis.com/auth/webmasters');
    const result = await submitSitemapToSearchConsole(siteUrl, sitemapUrl, accessToken);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Search Console API request failed.' },
      { status: 500 }
    );
  }
}
