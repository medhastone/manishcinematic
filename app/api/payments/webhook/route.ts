import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmVerifiedPayment } from '@/src/db/queries.ts';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'lumiere_atelier_webhook_secret_key';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    if (payload.event === 'payment.captured') {
      const entity = payload.payload?.payment?.entity;
      if (entity && entity.notes?.bookingId) {
        await confirmVerifiedPayment({
          bookingId: Number(entity.notes.bookingId),
          bookingCode: entity.notes.bookingCode,
          razorpayOrderId: entity.order_id,
          razorpayPaymentId: entity.id,
          razorpaySignature: signature,
          paymentMethod: entity.method || 'UPI',
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
