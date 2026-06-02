import { NextResponse } from 'next/server';
import { getSubscriberCount } from '@/lib/brevo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await getSubscriberCount();
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('Error fetching subscriber stats:', error);
    return NextResponse.json({ success: false, count: 0, error: error.message }, { status: 500 });
  }
}
