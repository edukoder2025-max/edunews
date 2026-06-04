import { NextResponse } from 'next/server';
import { submitSitemapToSearchConsole } from '@/lib/googleSearchConsole';

const apiKey = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://elironico.com';
const sitemapUrl = `${siteUrl.replace(/\/$/, '')}/sitemap.xml`;

export async function GET() {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_SEARCH_CONSOLE_API_KEY environment variable.' },
      { status: 400 }
    );
  }

  const result = await submitSitemapToSearchConsole(siteUrl, sitemapUrl, apiKey);
  return NextResponse.json(result, { status: result.status });
}
