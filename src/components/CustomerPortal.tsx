'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Calendar,
  MapPin,
  Download,
  RefreshCw,
  XCircle,
  UserCheck,
  MessageCircle,
  Phone,
  Mail,
  LogOut,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { StudioBooking, StudioPayment, formatINR } from '@/src/types/studio';

interface CustomerPortalProps {
  recentLocalBookings: StudioBooking[];
  recentLocalPayments: StudioPayment[];
  onStartNewBooking: () => void;
}

export function CustomerPortal({
  recentLocalBookings,
  recentLocalPayments,
  onStartNewBooking,
}: CustomerPortalProps) {
  const {
    firebaseUser,
    profile,
    loading,
    authError,
    signInWithGoogle,
    signOut,
    getFreshToken,
    updateProfile,
  } = useAuth();

  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [payments, setPayments] = useState<StudioPayment[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'payments' | 'profile'>('upcoming');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reschedule / Cancel modal state
  const [rescheduleBookingId, setRescheduleBookingId] = useState<number | null>(null);
  const [newEventDate, setNewEventDate] = useState<string>('2026-12-21');
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [activeReceipt, setActiveReceipt] = useState<{
    booking: StudioBooking;
    payment?: StudioPayment;
  } | null>(null);

  // Profile form state
  const [editName, setEditName] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const token = await getFreshToken();
      if (!token) return;
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Error loading customer bookings:', err);
    } finally {
      setFetching(false);
    }
  }, [firebaseUser, getFreshToken]);

  useEffect(() => {
    if (firebaseUser) {
      const id = window.setTimeout(() => {
        void loadBookings();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [firebaseUser, loadBookings]);

  // Combine server bookings with any bookings created in the current browser session
  const mergedBookings = React.useMemo(() => {
    const map = new Map<number, StudioBooking>();
    for (const b of recentLocalBookings) map.set(b.id, b);
    for (const b of bookings) map.set(b.id, b);
    return Array.from(map.values());
  }, [bookings, recentLocalBookings]);

  const mergedPayments = React.useMemo(() => {
    const map = new Map<number, StudioPayment>();
    for (const p of recentLocalPayments) map.set(p.id, p);
    for (const p of payments) map.set(p.id, p);
    return Array.from(map.values());
  }, [payments, recentLocalPayments]);

  const todayIso = '2026-11-18';
  const upcomingBookings = mergedBookings.filter((b) => b.eventDate >= todayIso);
  const pastBookings = mergedBookings.filter((b) => b.eventDate < todayIso);

  const handleRequestReschedule = async (bookingId: number) => {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const token = await getFreshToken();
      if (!token) throw new Error('Please sign in with Google to submit a reschedule request.');

      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          action: 'reschedule',
          rescheduleDate: newEventDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reschedule request failed.');

      setStatusMessage(`Reschedule request for ${newEventDate} submitted to Studio Production Desk.`);
      setRescheduleBookingId(null);
      await loadBookings();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleRequestCancel = async (bookingId: number) => {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const token = await getFreshToken();
      if (!token) throw new Error('Please sign in with Google to submit a cancellation request.');

      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          action: 'cancel',
          reason: cancelReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation request failed.');

      setStatusMessage('Cancellation request logged. Our producer will review your retainer terms.');
      setCancelBookingId(null);
      setCancelReason('');
      await loadBookings();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await updateProfile({
        name: editName ?? profile?.name ?? '',
        phone: editPhone ?? profile?.phone ?? '',
      });
      setStatusMessage('Client profile updated in PostgreSQL.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center border border-stone-800 rounded-2xl bg-[#29050E]">
        <p className="text-sm text-stone-400">Initializing client authentication session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Client Authentication Banner */}
      <div className="p-6 rounded-2xl border border-stone-800 bg-[#29050E] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs text-stone-400">Manish Cinematic Client Concierge & Booking Vault</p>
          <h3 className="text-2xl font-serif text-stone-100 mt-0.5">
            {firebaseUser
              ? `Welcome, ${profile?.name || firebaseUser.displayName || firebaseUser.email}`
              : 'Client Account & Booking Portal'}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            {firebaseUser
              ? `${firebaseUser.email} · Role: ${(profile?.role || 'customer').toUpperCase()}`
              : 'Sign in with Google to synchronize your bookings, download tax receipts, and request schedule changes.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!firebaseUser ? (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Sign In with Google
            </button>
          ) : (
            <button
              type="button"
              onClick={signOut}
              className="px-4 py-2 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium inline-flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-700/70 text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-1 p-1 bg-stone-900 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-amber-600 text-white'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Upcoming Events ({upcomingBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'past'
                ? 'bg-amber-600 text-white'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Past Events ({pastBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-amber-600 text-white'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Payment History & Receipts ({mergedPayments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-amber-600 text-white'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Profile & Studio Contact
          </button>
        </div>

        <button
          type="button"
          onClick={onStartNewBooking}
          className="px-4 py-2 rounded-lg bg-stone-100 text-stone-950 hover:bg-white text-xs font-medium transition-colors whitespace-nowrap"
        >
          + Book New Shoot
        </button>
      </div>

      {/* Tab Content: Upcoming or Past Bookings */}
      {(activeTab === 'upcoming' || activeTab === 'past') && (
        <div className="space-y-4">
          {fetching && (
            <p className="text-xs text-stone-400">Refreshing bookings from PostgreSQL...</p>
          )}

          {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 ? (
            <div className="p-10 rounded-2xl border border-stone-800/80 bg-[#29050E] text-center space-y-3">
              <p className="text-base font-serif text-stone-200">
                No {activeTab === 'upcoming' ? 'upcoming' : 'past'} studio commissions found.
              </p>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Reserve your shoot date through our interactive booking wizard with instant 30% advance confirmation.
              </p>
              <button
                type="button"
                onClick={onStartNewBooking}
                className="mt-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium"
              >
                Launch Booking Wizard
              </button>
            </div>
          ) : (
            (activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((b) => {
              const relatedPayment = mergedPayments.find((p) => p.bookingId === b.id);
              return (
                <div
                  key={b.id}
                  className="p-6 rounded-2xl border border-stone-800 bg-[#29050E] space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-stone-800/80">
                    <div>
                      <div className="text-xs text-stone-400 font-mono">
                        {b.bookingCode} · Status: <span className="text-amber-300 uppercase">{b.bookingStatus}</span> · Payment: <span className="text-emerald-400 uppercase">{b.paymentStatus}</span>
                      </div>
                      <h4 className="text-xl font-serif text-stone-100 mt-1">
                        {b.eventName} — {b.serviceName}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Package: {b.packageName} · Assigned Lead Photographer:{' '}
                        <span className="text-stone-200">{b.assignedPhotographer || 'Awaiting Assignment'}</span> · Cinematographer:{' '}
                        <span className="text-stone-200">{b.assignedVideographer || 'Awaiting Assignment'}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="px-3.5 py-2 rounded-lg bg-stone-900 border border-stone-800">
                        <span className="text-stone-400 block">Paid Advance</span>
                        <span className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
                          {formatINR(b.paidAmount)}
                        </span>
                      </div>
                      <div className="px-3.5 py-2 rounded-lg bg-stone-900 border border-stone-800">
                        <span className="text-stone-400 block">Remaining Balance</span>
                        <span className="font-mono text-sm font-semibold text-amber-300 tabular-nums">
                          {formatINR(b.remainingBalance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-300">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-mono">{b.eventDate}</span> ({b.eventStartTime})
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {b.eventVenue}, {b.city}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveReceipt({ booking: b, payment: relatedPayment })}
                        className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        Download Receipt
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRescheduleBookingId(rescheduleBookingId === b.id ? null : b.id)
                        }
                        className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        Reschedule
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancelBookingId(cancelBookingId === b.id ? null : b.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 inline-flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel Request
                      </button>
                    </div>
                  </div>

                  {/* Reschedule Drawer */}
                  {rescheduleBookingId === b.id && (
                    <div className="p-4 rounded-xl bg-stone-900 border border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-stone-300">New Preferred Date:</label>
                        <input
                          type="date"
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-xs font-mono text-stone-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRequestReschedule(b.id)}
                        className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium"
                      >
                        Submit Reschedule Request
                      </button>
                    </div>
                  )}

                  {/* Cancellation Drawer */}
                  {cancelBookingId === b.id && (
                    <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/70 space-y-3">
                      <label className="block text-xs text-rose-200">
                        Reason for Cancellation Request:
                      </label>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Event postponed / venue change..."
                        className="w-full px-3 py-2 rounded-lg border border-rose-800 bg-stone-950 text-xs text-stone-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleRequestCancel(b.id)}
                        className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-medium"
                      >
                        Confirm Cancellation Request
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: Payment History */}
      {activeTab === 'payments' && (
        <div className="border border-stone-800 rounded-2xl bg-[#29050E] overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/80 text-stone-400">
                <th className="p-4">Receipt #</th>
                <th className="p-4">Booking Code</th>
                <th className="p-4">Razorpay Payment ID</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/70">
              {mergedPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No payment receipts recorded yet.
                  </td>
                </tr>
              ) : (
                mergedPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-900/40">
                    <td className="p-4 font-mono text-stone-100">{p.receiptNumber}</td>
                    <td className="p-4 font-mono text-amber-300">{p.bookingCode}</td>
                    <td className="p-4 font-mono text-stone-300">{p.razorpayPaymentId}</td>
                    <td className="p-4 text-stone-200">{p.paymentMethod}</td>
                    <td className="p-4 font-mono font-semibold text-emerald-400 tabular-nums">
                      {formatINR(p.amount)}
                    </td>
                    <td className="p-4 text-emerald-400 font-mono uppercase">{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Profile & Contact Studio */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleSaveProfile}
            className="p-6 rounded-2xl border border-stone-800 bg-[#29050E] space-y-4"
          >
            <h4 className="text-lg font-serif text-stone-100">Client Profile Management</h4>
            <div>
              <label className="block text-xs text-stone-400 mb-1">Full Name</label>
              <input
                type="text"
                value={editName ?? profile?.name ?? ''}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">WhatsApp / Mobile Number</label>
              <input
                type="tel"
                value={editPhone ?? profile?.phone ?? ''}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100"
              />
            </div>
            <button
              type="submit"
              disabled={!firebaseUser}
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium disabled:opacity-40"
            >
              Save Profile Changes
            </button>
          </form>

          <div className="p-6 rounded-2xl border border-stone-800 bg-[#29050E] space-y-4">
            <h4 className="text-lg font-display italic text-stone-100">Direct Production Desk Contact</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Need custom wedding cinema coverage, drone aerials, short film production, or custom packages in Begusarai & Bihar? Reach Manish Cinematic directly.
            </p>
            <div className="space-y-2 text-xs text-stone-200 font-mono">
              <p>Studio Address: Ayodhya Chowk Tegra, Begusarai, Bihar</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:+918210057153"
                aria-label="Call Manish Cinematic"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#e10600] hover:bg-[#c50500] text-white text-xs font-medium"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <a
                href="https://wa.me/918210057153?text=Hello%20Manish%20Cinematic%2C%20I%20would%20like%20to%20discuss%20my%20booking."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=manishcinematic821005@gmail.com&su=Booking%20Support%20-%20Manish%20Cinematic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-stone-700 bg-stone-900 hover:border-[#e10600] text-stone-200 hover:text-white text-xs font-medium"
              >
                <Mail className="w-4 h-4 text-[#e10600]" />
                Gmail
              </a>
              <a
                href="https://youtube.com/@biharmanishcinematic?si=9g4A5srHKq-bBkTA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-stone-700 bg-stone-900 hover:border-[#e10600] text-stone-200 hover:text-white text-xs font-medium"
              >
                YouTube
              </a>
              <a
                href="https://www.instagram.com/manish___cinematic?utm_source=qr&gwpx=bG9nemV3bGgyZGJm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-stone-700 bg-stone-900 hover:border-[#e10600] text-stone-200 hover:text-white text-xs font-medium"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/share/1FnsmZuGuc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-stone-700 bg-stone-900 hover:border-[#e10600] text-stone-200 hover:text-white text-xs font-medium"
              >
                Facebook
              </a>
              <a
                href="https://www.google.com/maps/place/manishcinematic+video+and+photo+photographer/@25.5035447,85.9252307,1419m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39f273aa7eaa3209:0x130f2bb553405f7!8m2!3d25.5035447!4d85.9278056!16s%2Fg%2F11zkvwx_91?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MTExNi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-stone-700 bg-stone-900 hover:border-[#e10600] text-stone-200 hover:text-white text-xs font-medium"
              >
                Google Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 rounded-2xl border border-stone-700 bg-[#29050E] space-y-4 text-xs font-mono text-stone-300">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-sm font-bold text-stone-100">
                MANISH CINEMATIC — OFFICIAL PAYMENT RECEIPT
              </span>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p>Booking Code: {activeReceipt.booking.bookingCode}</p>
            <p>Receipt Number: {activeReceipt.payment?.receiptNumber || `RCPT-${activeReceipt.booking.bookingCode}`}</p>
            <p>Client: {activeReceipt.booking.customerName} ({activeReceipt.booking.customerEmail})</p>
            <p>Service & Package: {activeReceipt.booking.serviceName} — {activeReceipt.booking.packageName}</p>
            <p>Event Date & City: {activeReceipt.booking.eventDate} · {activeReceipt.booking.city}</p>
            <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 space-y-1">
              <p>Total Contract Value: {formatINR(activeReceipt.booking.totalAmount)}</p>
              <p className="text-emerald-400">Paid Advance: {formatINR(activeReceipt.booking.paidAmount)}</p>
              <p className="text-amber-300">Remaining Balance: {formatINR(activeReceipt.booking.remainingBalance)}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white font-sans font-medium"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 font-sans"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
