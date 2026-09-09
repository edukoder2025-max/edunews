import { NextResponse } from 'next/server';
import { getSubscriptionDetails } from '@/lib/subscriptionUtils';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      );
    }

    // Get subscription details
    const subscription = await getSubscriptionDetails(email);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Return subscription status
    return NextResponse.json({
      email,
      subscriptionStatus: 'active',
      plan: subscription.plan,
      startedAt: subscription.started_at,
      expiresAt: subscription.expires_at,
    });
  } catch (err: any) {
    console.error('Error getting subscription:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
