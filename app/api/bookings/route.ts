import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyBearerToken } from '@/src/lib/firebase-admin.ts';
import {
  createPendingBooking,
  getCustomerBookings,
  requestBookingModification,
} from '@/src/db/queries.ts';
import { sendBookingNotificationEmail } from '@/src/lib/send-booking-email.ts';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'lumiere_atelier_webhook_secret_key';

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyBearerToken(req.headers.get('authorization'));
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in to view bookings' }, { status: 401 });
    }

    const data = await getCustomerBookings(decoded.uid, decoded.email);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch customer bookings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer bookings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyBearerToken(req.headers.get('authorization'));
    const body = await req.json();

    const userUid = decoded?.uid || body.guestUid || `guest-${Date.now()}`;

    if (!body.customerName || !body.customerEmail || !body.customerPhone || !body.eventDate || !body.packageId) {
      return NextResponse.json(
        { error: 'Please complete all required customer and event details.' },
        { status: 400 }
      );
    }

    const booking = await createPendingBooking({
      userUid,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      serviceSlug: body.serviceSlug,
      packageId: Number(body.packageId),
      selectedAddonSlugs: Array.isArray(body.selectedAddons) ? body.selectedAddons : [],
      eventFunctions: Array.isArray(body.eventFunctions) ? body.eventFunctions : ['Main Ceremony'],
      eventName: body.eventName || `${body.customerName} Commission`,
      eventVenue: body.eventVenue || 'Begusarai Venue',
      city: body.city || 'Begusarai, Bihar',
      eventDate: body.eventDate,
      eventEndDate: body.eventEndDate || body.eventDate,
      eventStartTime: body.eventStartTime || '10:00 AM',
      eventDurationHours: Number(body.eventDurationHours) || 8,
      specialInstructions: body.specialInstructions || '',
    });

    // Dispatch free studio booking email notification (non-blocking if external mail service is slow)
    const requestOrigin = req.headers.get('origin') || undefined;
    const emailNotification = await sendBookingNotificationEmail(
      {
        bookingCode: booking.bookingCode,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        serviceName:
          Array.isArray(body.eventFunctions) && body.eventFunctions[0]
            ? String(body.eventFunctions[0])
            : booking.serviceName,
        eventDate: booking.eventDate,
        eventVenue: booking.eventVenue,
        city: booking.city,
        specialInstructions: booking.specialInstructions || '',
      },
      requestOrigin
    );

    // Generate server-issued Razorpay order ID and order token for secure checkout
    const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const orderToken = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(`${booking.id}:${booking.bookingCode}:${razorpayOrderId}:${booking.advanceAmount}`)
      .digest('hex');

    return NextResponse.json({
      booking,
      emailNotification,
      razorpayOrder: {
        orderId: razorpayOrderId,
        amountInPaise: booking.advanceAmount * 100,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_lumiere_atelier',
        orderToken,
      },
    });
  } catch (error: any) {
    console.error('Failed to create pending booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const decoded = await verifyBearerToken(req.headers.get('authorization'));
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await requestBookingModification({
      bookingId: Number(body.bookingId),
      action: body.action,
      rescheduleDate: body.rescheduleDate,
      reason: body.reason,
    });

    return NextResponse.json({ booking: updated });
  } catch (error: any) {
    console.error('Failed to modify booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 400 }
    );
  }
}
