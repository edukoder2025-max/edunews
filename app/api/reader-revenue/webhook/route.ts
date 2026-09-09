import { NextResponse } from 'next/server';
import { applyBenefitsForPurchase } from '@/lib/readerRevenue';
import { validateWebhookSignature } from '@/lib/webhookSecurity';

export async function POST(request: Request) {
  try {
    const secret = process.env.RRM_WEBHOOK_SECRET || '';
    if (!secret) {
      console.error('RRM_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Get raw body for signature validation
    const body = await request.text();
    const bodyJson = JSON.parse(body);

    // Try signature validation (method 1: header-based secret)
    const headerSecret = request.headers.get('x-rrm-secret') || '';
    const signature = request.headers.get('x-rrm-signature') || '';
    
    // Validate using either method
    const isValid = headerSecret === secret || validateWebhookSignature(body, signature, secret);
    
    if (!isValid) {
      console.warn('Invalid webhook signature/secret');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate payload
    const { type, productId, customerEmail, customerName } = bodyJson;
    
    if (type !== 'purchase') {
      return NextResponse.json(
        { success: false, error: 'Invalid event type (expected: purchase)' },
        { status: 400 }
      );
    }

    if (!productId || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing productId or customerEmail' },
        { status: 400 }
      );
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Apply benefits
    const result = await applyBenefitsForPurchase(productId, customerEmail, customerName);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to apply benefits' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Beneficios aplicados exitosamente',
      email: customerEmail,
      plan: productId,
    });

  } catch (err: any) {
    console.error('Reader Revenue webhook error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
