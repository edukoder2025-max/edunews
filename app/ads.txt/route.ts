import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  const configuredClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';
  const publisherId = configuredClientId
    .replace(/^ca-/, '')
    .replace(/^pub-/, '')
    .trim();

  if (!publisherId) {
    return new NextResponse('', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new NextResponse(`google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
