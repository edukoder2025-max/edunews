import { NextResponse } from 'next/server';
import { isSubscriptionActive } from '@/lib/subscriptionUtils';

const ARTICLES_PER_MONTH = 3; // Free articles per month for non-subscribers

export async function POST(request: Request) {
  try {
    const { email, articleId } = await request.json();

    if (!email || !articleId) {
      return NextResponse.json(
        { error: 'Email and articleId are required' },
        { status: 400 }
      );
    }

    // Check if user has active subscription
    const hasSubscription = await isSubscriptionActive(email);

    if (hasSubscription) {
      // Subscribed users have unlimited access
      return NextResponse.json({
        meteringStatus: 'unlimited',
        canAccess: true,
        articlesRemaining: -1,
      });
    }

    // Non-subscribed users have limited access
    // In a real implementation, you would track this in a database
    // For now, we allow the article but return the limit

    return NextResponse.json({
      meteringStatus: 'limited',
      canAccess: true,
      articlesRemaining: ARTICLES_PER_MONTH,
      articlesRead: 0, // In real implementation, track this
      limit: ARTICLES_PER_MONTH,
    });
  } catch (err: any) {
    console.error('Error processing metering:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
