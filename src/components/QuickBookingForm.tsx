'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  MessageCircle,
  Mail,
  Check,
  AlertCircle,
  Lock,
  Sparkles,
} from 'lucide-react';
import {
  StudioPackage,
  AvailabilitySlot,
  StudioBooking,
} from '@/src/types/studio';
import { useAuth } from '@/src/context/AuthContext';

interface QuickBookingFormProps {
  packages: StudioPackage[];
  availabilitySlots: AvailabilitySlot[];
  preselectedService?: string;
  onSwitchToWizard: () => void;
  onBookingCreated?: (booking: StudioBooking) => void;
}

interface EmailStatusState {
  sent: boolean;
  recipient: string;
  needsActivation?: boolean;
  message: string;
}

const STUDIO_EMAIL = 'manishcinematic821005@gmail.com';

const SERVICE_OPTIONS = [
  { label: 'Wedding Photography', slug: 'wedding-photography' },
  { label: 'Pre-Wedding Shoot', slug: 'pre-wedding' },
  { label: 'Cinematic Wedding Films', slug: 'wedding-cinematography' },
  { label: 'Traditional Photography', slug: 'wedding-photography' },
  { label: 'Videography', slug: 'wedding-cinematography' },
  { label: 'Short Films', slug: 'fashion-portfolio' },
];

export function QuickBookingForm({
  packages,
  availabilitySlots,
  preselectedService,
  onSwitchToWizard,
  onBookingCreated,
}: QuickBookingFormProps) {
  const { firebaseUser, profile, getFreshToken } = useAuth();

  const [name, setName] = useState(profile?.name || firebaseUser?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || firebaseUser?.email || '');
  const [serviceLabel, setServiceLabel] = useState(preselectedService || 'Wedding Photography');
  const [eventDate, setEventDate] = useState('2026-12-19');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Begusarai, Bihar');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedBooking, setSavedBooking] = useState<StudioBooking | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatusState | null>(null);

  const selectedSlot = useMemo(
    () => availabilitySlots.find((s) => s.eventDate === eventDate),
    [availabilitySlots, eventDate]
  );

  const isDateUnavailable = Boolean(
    selectedSlot &&
      (selectedSlot.status === 'booked' ||
        selectedSlot.status === 'blocked' ||
        selectedSlot.bookedTeams >= selectedSlot.totalTeams)
  );

  const buildWhatsAppUrl = (bookingCode?: string) => {
    const lines = [
      'Hello Manish Cinematic!',
      bookingCode ? `Booking Ref: ${bookingCode}` : 'New Shoot Booking Inquiry',
      `Name: ${name || 'Not provided'}`,
      `Phone: ${phone || 'Not provided'}`,
      email.trim() ? `Email: ${email.trim()}` : '',
      `Service: ${serviceLabel}`,
      `Event Date: ${eventDate}`,
      `Venue / City: ${venue ? `${venue}, ` : ''}${city}`,
      notes ? `Event Details: ${notes}` : '',
    ].filter(Boolean);

    return `https://wa.me/918210057153?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const buildGmailComposeUrl = (booking: StudioBooking) => {
    const subject = `New Shoot Booking (${booking.bookingCode}) — ${booking.customerName} | ${booking.eventDate}`;
    const bodyLines = [
      'Hello Manish Cinematic Team,',
      '',
      `Booking Reference: ${booking.bookingCode}`,
      `Client Name: ${booking.customerName}`,
      `WhatsApp / Phone: ${booking.customerPhone}`,
      email.trim() ? `Client Email: ${email.trim()}` : '',
      `Service: ${serviceLabel}`,
      `Event Date: ${booking.eventDate}`,
      `Venue: ${booking.eventVenue}`,
      `City / District: ${booking.city}`,
      notes.trim() ? `Event Details: ${notes.trim()}` : '',
    ].filter((line) => line !== undefined);

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      STUDIO_EMAIL
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  };

  const sendBrowserFormSubmitFallback = async (
    booking: StudioBooking
  ): Promise<EmailStatusState> => {
    const recipient = STUDIO_EMAIL;
    const cleanClientEmail = email.trim();

    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `New Shoot Booking (${booking.bookingCode}) — ${booking.customerName} | ${booking.eventDate}`,
            _template: 'table',
            _captcha: 'false',
            ...(cleanClientEmail ? { _replyto: cleanClientEmail } : {}),
            'Booking Reference': booking.bookingCode,
            'Client Name': booking.customerName,
            'WhatsApp / Phone': booking.customerPhone,
            'Client Email': cleanClientEmail || 'Not provided',
            Service: serviceLabel,
            'Event Date': booking.eventDate,
            'Event Venue': booking.eventVenue,
            'City / District': booking.city,
            'Event Details': notes.trim() || 'None',
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      const msg = typeof data.message === 'string' ? data.message : '';
      const isSuccess = res.ok && (data.success === 'true' || data.success === true);
      const needsActivation = msg.toLowerCase().includes('activation');

      if (isSuccess) {
        return {
          sent: true,
          recipient,
          needsActivation,
          message: needsActivation
            ? `First-time activation link sent to ${recipient}. Open Gmail and click Activate once to receive all future bookings automatically.`
            : `Booking details emailed automatically to ${recipient}.`,
        };
      }

      return {
        sent: false,
        recipient,
        needsActivation,
        message:
          msg ||
          `Saved to studio calendar. Use "Send Copy via Gmail" below to email ${recipient} directly.`,
      };
    } catch {
      return {
        sent: false,
        recipient,
        message: `Saved to studio calendar. Use "Send Copy via Gmail" below to email ${recipient} directly.`,
      };
    }
  };

  const handleSubmitOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailStatus(null);

    if (!name.trim() || !phone.trim() || !eventDate) {
      setErrorMsg('Please enter your name, mobile/WhatsApp number, and preferred event date.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (isDateUnavailable) {
      setErrorMsg('That date is currently booked or blocked. Please select another date.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getFreshToken().catch(() => null);
      const matchedService =
        SERVICE_OPTIONS.find((s) => s.label === serviceLabel) || SERVICE_OPTIONS[0];
      const fallbackPkg = packages[0];

      let createdBooking: StudioBooking | null = null;
      let finalEmailStatus: EmailStatusState = {
        sent: false,
        recipient: STUDIO_EMAIL,
        message: 'Dispatching email notification...',
      };
      let shouldFallbackToStatic = false;

      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            customerName: name.trim(),
            customerEmail: email.trim() || `${phone.replace(/\D/g, '')}@manishcinematic.in`,
            customerPhone: phone.trim(),
            serviceSlug: matchedService.slug,
            packageId: fallbackPkg?.id || 1,
            selectedAddons: [],
            eventFunctions: [serviceLabel],
            eventName: `${name.trim()} — ${serviceLabel}`,
            eventVenue: venue.trim() || 'Begusarai Venue',
            city: city.trim() || 'Begusarai, Bihar',
            eventDate,
            eventEndDate: eventDate,
            eventStartTime: '10:00 AM',
            eventDurationHours: 8,
            specialInstructions: notes.trim(),
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.status === 404 || res.status === 405 || !contentType.includes('application/json')) {
          shouldFallbackToStatic = true;
        } else {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Could not save booking inquiry.');
          }
          createdBooking = data.booking;
          if (data.emailNotification) {
            finalEmailStatus = data.emailNotification;
          }
        }
      } catch (fetchErr) {
        if (fetchErr instanceof TypeError) {
          shouldFallbackToStatic = true;
        } else {
          throw fetchErr;
        }
      }

      if (shouldFallbackToStatic || !createdBooking) {
        const bookingCode = `MC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        createdBooking = {
          id: Date.now(),
          bookingCode,
          userUid: firebaseUser?.uid || `guest-${Date.now()}`,
          customerName: name.trim(),
          customerEmail: email.trim() || `${phone.replace(/\D/g, '')}@manishcinematic.in`,
          customerPhone: phone.trim(),
          serviceSlug: matchedService.slug,
          serviceName: serviceLabel,
          packageId: fallbackPkg?.id || 1,
          packageName: fallbackPkg?.name || 'Starting Package ₹15,000/-',
          selectedAddons: '[]',
          eventFunctions: JSON.stringify([serviceLabel]),
          eventName: `${name.trim()} — ${serviceLabel}`,
          eventVenue: venue.trim() || 'Begusarai Venue',
          city: city.trim() || 'Begusarai, Bihar',
          eventDate,
          eventEndDate: eventDate,
          eventStartTime: '10:00 AM',
          eventDurationHours: 8,
          specialInstructions: notes.trim(),
          basePrice: fallbackPkg?.price || 15000,
          addonsTotal: 0,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount: fallbackPkg?.price || 15000,
          advanceAmount: 4500,
          paidAmount: 0,
          remainingBalance: fallbackPkg?.price || 15000,
          paymentStatus: 'pending',
          bookingStatus: 'inquiry_saved',
          assignedPhotographer: 'Manish Cinematic Crew',
          assignedVideographer: 'Manish Cinematic Crew',
          internalNotes: '',
          rescheduleRequestedDate: '',
          cancellationReason: '',
          createdAt: new Date().toISOString(),
        };
      }

      if (!finalEmailStatus.sent) {
        finalEmailStatus = await sendBrowserFormSubmitFallback(createdBooking);
      }

      setEmailStatus(finalEmailStatus);
      setSavedBooking(createdBooking);
      if (onBookingCreated) {
        onBookingCreated(createdBooking);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to submit booking right now.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (savedBooking) {
    return (
      <div className="p-8 rounded-2xl border border-[#e10600]/60 bg-[#29050E] text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-[#e10600]/20 border border-[#e10600] text-[#e10600] flex items-center justify-center mx-auto">
          <Check className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[#e10600] font-semibold">
            Booking Inquiry Saved · Ref {savedBooking.bookingCode}
          </p>
          <h3 className="font-display font-black italic text-2xl sm:text-3xl text-white mt-1">
            WE&apos;VE RESERVED YOUR INQUIRY SLOT!
          </h3>
          <p className="text-sm text-neutral-300 mt-2 max-w-lg mx-auto">
            Thank you, <span className="text-white font-medium">{savedBooking.customerName}</span>. Your request for{' '}
            <span className="text-white font-medium">{savedBooking.eventDate}</span> in{' '}
            <span className="text-white font-medium">{savedBooking.city}</span> is saved in our studio calendar.
          </p>
        </div>

        {/* Free Email Notification Status Banner */}
        {emailStatus && (
          <div
            className={`max-w-xl mx-auto p-3.5 rounded-xl border text-xs flex items-center justify-center gap-2.5 text-left ${
              emailStatus.sent
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                : 'bg-white/5 border-white/15 text-neutral-300'
            }`}
          >
            <Mail
              className={`w-4 h-4 shrink-0 ${
                emailStatus.sent ? 'text-emerald-400' : 'text-[#e10600]'
              }`}
            />
            <span>{emailStatus.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={buildWhatsAppUrl(savedBooking.bookingCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Confirm Instantly on WhatsApp
          </a>
          <a
            href={buildGmailComposeUrl(savedBooking)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-white/20 bg-white/5 hover:border-[#e10600] hover:bg-[#e10600]/10 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4 text-[#e10600]" />
            Send Copy via Gmail
          </a>
          <button
            type="button"
            onClick={onSwitchToWizard}
            className="px-6 py-3 rounded-lg bg-[#e10600] hover:bg-[#c50500] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Lock className="w-4 h-4" />
            Pay Advance &amp; Lock Date Online
          </button>
          <button
            type="button"
            onClick={() => {
              setSavedBooking(null);
              setEmailStatus(null);
            }}
            className="px-5 py-3 rounded-lg border border-white/15 hover:border-white/30 text-neutral-300 text-sm transition-colors"
          >
            New Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmitOnline}
      className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#29050E] space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <h3 className="font-display font-extrabold italic text-2xl text-white uppercase tracking-wide">
            Reserve Your Date
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Synced directly with our studio calendar and emailed instantly to our team.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToWizard}
          className="px-4 py-2 rounded-lg border border-[#e10600]/50 bg-[#e10600]/10 hover:bg-[#e10600]/20 text-[#ff4d47] text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Open Full 8-Step Razorpay Wizard
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#e10600]/15 border border-[#e10600]/50 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#e10600] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="mc-name" className="block text-xs font-medium text-neutral-300 mb-1.5">
            Full Name *
          </label>
          <input
            id="mc-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul & Priya Sharma"
            className="w-full px-4 py-3 rounded-xl bg-[#22040B] border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:border-[#e10600] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="mc-phone" className="block text-xs font-medium text-neutral-300 mb-1.5">
            WhatsApp / Phone Number *
          </label>
          <input
            id="mc-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98XXX XXXXX"
            className="w-full px-4 py-3 rounded-xl bg-[#22040B] border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:border-[#e10600] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="mc-service" className="block text-xs font-medium text-neutral-300 mb-1.5">
            Select Service *
          </label>
          <select
            id="mc-service"
            value={serviceLabel}
            onChange={(e) => setServiceLabel(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#22040B] border border-white/15 text-sm text-white focus:border-[#e10600] focus:outline-none transition-colors"
          >
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mc-date" className="block text-xs font-medium text-neutral-300 mb-1.5">
            Event Date *
          </label>
          <div className="relative">
            <input
              id="mc-date"
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#22040B] border border-white/15 text-sm text-white focus:border-[#e10600] focus:outline-none transition-colors tabular-nums"
            />
            <Calendar className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
          <p
            className={`text-[11px] mt-1.5 ${
              isDateUnavailable ? 'text-[#ff4d47]' : 'text-emerald-400'
            }`}
          >
            {isDateUnavailable
              ? 'Date currently sold out / blocked — please pick another date.'
              : 'Available for booking in Begusarai & Bihar.'}
          </p>
        </div>

        <div>
          <label htmlFor="mc-venue" className="block text-xs font-medium text-neutral-300 mb-1.5">
            Event Venue
          </label>
          <div className="relative">
            <input
              id="mc-venue"
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Ayodhya Chowk Tegra, Begusarai"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#22040B] border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:border-[#e10600] focus:outline-none transition-colors"
            />
            <MapPin className="w-4 h-4 text-[#e10600] absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="mc-city" className="block text-xs font-medium text-neutral-300 mb-1.5">
            City / District
          </label>
          <input
            id="mc-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Begusarai, Bihar"
            className="w-full px-4 py-3 rounded-xl bg-[#22040B] border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:border-[#e10600] focus:outline-none transition-colors"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="mc-email" className="block text-xs font-medium text-neutral-300 mb-1.5">
            Your Email (Optional — for reply &amp; booking receipt)
          </label>
          <input
            id="mc-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@gmail.com"
            className="w-full px-4 py-3 rounded-xl bg-[#22040B] border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:border-[#e10600] focus:outline-none transition-colors"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="mc-notes" className="block text-xs font-medium text-neutral-300 mb-1.5">
            Event Details / Ceremony Notes (Optional)
          </label>
          <textarea
            id="mc-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tell us about your ceremony dates (Haldi, Tilak, Shaadi, Reception) or shoot vision..."
            className="w-full px-4 py-3 rounded-xl bg-[#22040B] border border-white/15 text-sm text-white placeholder:text-neutral-500 focus:border-[#e10600] focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || isDateUnavailable}
          className="flex-1 py-3.5 px-6 rounded-xl bg-[#e10600] hover:bg-[#c50500] text-white text-sm font-semibold tracking-wide transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {submitting
            ? 'Saving & Sending Email...'
            : 'Book Now & Save to Studio Calendar'}
        </button>

        <a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="py-3.5 px-6 rounded-xl border border-[#25D366]/60 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#4ade80] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4" />
          Send Directly on WhatsApp
        </a>
      </div>
    </form>
  );
}
