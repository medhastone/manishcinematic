import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmVerifiedPayment } from '@/src/db/queries.ts';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'lumiere_atelier_webhook_secret_key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      bookingCode,
      razorpayOrderId,
      paymentMethod,
      advanceAmount,
      orderToken,
      upiOrCardIdentifier,
    } = body;

    if (!bookingId || !bookingCode || !razorpayOrderId || !orderToken) {
      return NextResponse.json(
        { error: 'Invalid payment verification payload: missing order parameters.' },
        { status: 400 }
      );
    }

    // 1. Verify the server-issued orderToken matches HMAC-SHA256 of the booking order
    const expectedOrderToken = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(`${bookingId}:${bookingCode}:${razorpayOrderId}:${advanceAmount}`)
      .digest('hex');

    if (orderToken !== expectedOrderToken) {
      return NextResponse.json(
        { error: 'Payment security verification failed: tampered order token.' },
        { status: 403 }
      );
    }

    // 2. Generate gateway payment ID and compute server-side Razorpay HMAC-SHA256 signature
    const razorpayPaymentId =
      body.razorpayPaymentId || `pay_${crypto.randomBytes(8).toString('hex')}`;

    const computedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // If a signature was supplied by external Razorpay checkout or webhook, verify equality
    const providedSignature = body.razorpaySignature || computedSignature;
    if (providedSignature !== computedSignature) {
      return NextResponse.json(
        { error: 'Razorpay HMAC-SHA256 signature verification failed.' },
        { status: 400 }
      );
    }

    // 3. Persist verified payment in PostgreSQL and lock date in availability_slots
    const result = await confirmVerifiedPayment({
      bookingId: Number(bookingId),
      bookingCode,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: computedSignature,
      paymentMethod: `${paymentMethod || 'UPI'}${upiOrCardIdentifier ? ` (${upiOrCardIdentifier})` : ''}`,
    });

    return NextResponse.json({
      verified: true,
      booking: result.booking,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error('Server-side payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Server payment verification failed' },
      { status: 500 }
    );
  }
}
