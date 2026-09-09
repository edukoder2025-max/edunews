import { NextResponse } from 'next/server';

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://elironico.com';
const sitemapUrl = `${DEFAULT_SITE_URL.replace(/\/$/, '')}/sitemap.xml`;

export async function GET() {
  const googlePing = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  const bingPing = `https://www.bing.com/webmaster/ping.aspx?siteMap=${encodeURIComponent(sitemapUrl)}`;

  const responses = await Promise.allSettled([
    fetch(googlePing, { method: 'GET' }),
    fetch(bingPing, { method: 'GET' }),
  ]);

  const result = responses.map((response, index) => {
    const service = index === 0 ? 'google' : 'bing';
    if (response.status === 'fulfilled') {
      return {
        service,
        status: response.value.status,
        ok: response.value.ok,
      };
    }
    return {
      service,
      error: response.reason?.toString() ?? 'unknown error',
    };
  });

  return NextResponse.json({
    sitemap: sitemapUrl,
    results: result,
  });
}
