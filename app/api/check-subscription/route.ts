import { NextResponse } from 'next/server';
import { userHasBenefit } from '@/lib/subscriptionUtils';
import type { Benefit } from '@/lib/subscriptionUtils';

export async function POST(request: Request) {
  try {
    const { email, requiredBenefit } = await request.json();

    if (!email || !requiredBenefit) {
      return NextResponse.json(
        { hasAccess: false, error: 'Missing email or requiredBenefit' },
        { status: 400 }
      );
    }

    const hasAccess = await userHasBenefit(email, requiredBenefit as Benefit);

    return NextResponse.json({ hasAccess });
  } catch (err: any) {
    console.error('Error checking subscription:', err);
    return NextResponse.json(
      { hasAccess: false, error: err.message },
      { status: 500 }
    );
  }
}
