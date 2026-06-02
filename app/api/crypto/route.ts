import { NextResponse } from 'next/server';
import { fetchLiveCryptoData } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchLiveCryptoData();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No crypto data available' }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/crypto route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
