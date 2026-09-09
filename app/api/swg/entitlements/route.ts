import { NextResponse } from 'next/server';
import { getSubscriptionDetails } from '@/lib/subscriptionUtils';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user has an active subscription
    const subscription = await getSubscriptionDetails(email);

    return NextResponse.json({
      isUserEntitled: !!subscription,
      entitlements: subscription ? [subscription.plan] : [],
      subscriptionDetails: subscription,
    });
  } catch (err: any) {
    console.error('Error getting entitlements:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
