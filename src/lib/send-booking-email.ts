export interface BookingEmailPayload {
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  eventDate: string;
  eventVenue: string;
  city: string;
  specialInstructions?: string;
}

export interface EmailDispatchResult {
  sent: boolean;
  provider: 'formsubmit' | 'none';
  recipient: string;
  needsActivation?: boolean;
  message: string;
}

const DEFAULT_STUDIO_EMAIL = 'manishcinematic821005@gmail.com';

export async function sendBookingNotificationEmail(
  payload: BookingEmailPayload,
  requestOrigin?: string
): Promise<EmailDispatchResult> {
  const recipient = process.env.STUDIO_BOOKING_EMAIL || DEFAULT_STUDIO_EMAIL;
  const subject = `New Shoot Booking (${payload.bookingCode}) — ${payload.customerName} | ${payload.eventDate}`;

  // Free FormSubmit AJAX API (zero-signup, zero-API-key free email forwarding)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const originHeader =
      requestOrigin || process.env.APP_URL || 'https://manishcinematic.in';
    const hasRealClientEmail =
      Boolean(payload.customerEmail) &&
      !payload.customerEmail.endsWith('@manishcinematic.in');

    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: originHeader,
          Referer: `${originHeader}/`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          ...(hasRealClientEmail ? { _replyto: payload.customerEmail } : {}),
          'Booking Reference': payload.bookingCode,
          'Client Name': payload.customerName,
          'WhatsApp / Phone': payload.customerPhone,
          'Client Email': hasRealClientEmail ? payload.customerEmail : 'Not provided',
          Service: payload.serviceName,
          'Event Date': payload.eventDate,
          'Event Venue': payload.eventVenue,
          'City / District': payload.city,
          'Event Details': payload.specialInstructions || 'None',
        }),
      }
    );
    clearTimeout(timeout);
    const data = await res.json().catch(() => ({}));

    const responseMsg = typeof data.message === 'string' ? data.message : '';
    const isSuccess = res.ok && (data.success === 'true' || data.success === true);
    const needsActivation = responseMsg.toLowerCase().includes('activation');

    if (isSuccess) {
      return {
        sent: true,
        provider: 'formsubmit',
        recipient,
        needsActivation,
        message: needsActivation
          ? `Activation email sent to ${recipient} — click Activate once in Gmail to receive instant booking emails.`
          : `Booking details emailed automatically to ${recipient}.`,
      };
    }

    return {
      sent: false,
      provider: 'formsubmit',
      recipient,
      needsActivation,
      message: responseMsg || 'Email service queued for client-side fallback.',
    };
  } catch (err) {
    clearTimeout(timeout);
    console.warn('FormSubmit server dispatch skipped/failed:', err);
    return {
      sent: false,
      provider: 'formsubmit',
      recipient,
      message: 'Server email attempt timed out; trying browser fallback.',
    };
  }
}
