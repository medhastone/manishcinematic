'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  Calendar,
  Package,
  Image as ImageIcon,
  Users,
  BarChart3,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import {
  StudioBooking,
  StudioPayment,
  StudioPackage,
  AvailabilitySlot,
  PortfolioItem,
  StudioTestimonial,
  formatINR,
} from '@/src/types/studio';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  onCatalogRefresh: () => void;
}

export function AdminDashboard({ onCatalogRefresh }: AdminDashboardProps) {
  const { firebaseUser, profile, signInWithGoogle, getFreshToken, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'bookings' | 'packages' | 'availability' | 'gallery' | 'customers' | 'reports'
  >('overview');

  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [payments, setPayments] = useState<StudioPayment[]>([]);
  const [packages, setPackages] = useState<StudioPackage[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [testimonials, setTestimonials] = useState<StudioTestimonial[]>([]);
  const [users, setUsers] = useState<
    { id: number; uid: string; email: string; name: string; phone: string; role: string }[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Booking edit modal state
  const [editingBooking, setEditingBooking] = useState<StudioBooking | null>(null);
  const [editPhotographer, setEditPhotographer] = useState<string>('');
  const [editVideographer, setEditVideographer] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>('');
  const [editPaidAmount, setEditPaidAmount] = useState<number>(0);
  const [editInternalNotes, setEditInternalNotes] = useState<string>('');
  const [editEventDate, setEditEventDate] = useState<string>('');

  // Package create/edit state
  const [pkgForm, setPkgForm] = useState({
    id: undefined as number | undefined,
    serviceSlug: 'wedding-photography',
    name: '',
    tier: 'Signature',
    price: 120000,
    durationHours: 12,
    photographersCount: 2,
    cinematographersCount: 2,
    editedPhotosCount: 500,
    videoDeliverables: '5-Min Cinematic Highlight + 25-Min Feature Film',
    albumIncluded: true,
    droneIncluded: true,
    benefits: 'Archival Linen Album, Drone Coverage, Next-Day Previews',
    advanceType: 'percentage',
    advanceValue: 30,
    seasonalDiscountPercent: 5,
    imageUrl: '/assets/aistudio/2026-11-19_13.45.19_6f2fb6c3.jpg',
    active: true,
  });

  // Availability form state
  const [slotForm, setSlotForm] = useState({
    eventDate: '2026-12-25',
    status: 'blocked',
    totalTeams: 3,
    bookedTeams: 3,
    notes: 'Studio Holiday / Equipment Maintenance Block',
  });

  // Gallery form state
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Wedding',
    location: 'Begusarai, Bihar',
    mediaType: 'image',
    imageUrl: '/assets/aistudio/2026-11-19_13.44.44_328bb63e.jpg',
    videoUrl: '',
    aspectRatio: '3:4',
    exifMeta: 'Real Camera Shot · 85mm f/1.8 Prime · Natural & Studio Lighting',
    featured: true,
  });

  // Testimonial form state
  const [testimonialForm, setTestimonialForm] = useState({
    clientName: '',
    clientRole: 'Royal Destination Wedding',
    eventLocation: 'Jaipur',
    quote: '',
    outcomeStat: '600+ Archival Stills Delivered in 12 Days',
    rating: 5,
  });

  const loadAdminData = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const token = await getFreshToken();
      if (!token) return;
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Admin permission required.');
      }
      const data = await res.json();
      setErrorMsg(null);
      setBookings(data.bookings || []);
      setPayments(data.payments || []);
      setPackages(data.packages || []);
      setAvailabilitySlots(data.availabilitySlots || []);
      setPortfolioItems(data.portfolioItems || []);
      setTestimonials(data.testimonials || []);
      setUsers(data.users || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, getFreshToken]);

  useEffect(() => {
    if (firebaseUser && profile?.role === 'admin') {
      const id = window.setTimeout(() => {
        void loadAdminData();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [firebaseUser, profile?.role, loadAdminData]);

  const metrics = useMemo(() => {
    const totalBookings = bookings.length;
    const upcomingShoots = bookings.filter((b) => b.eventDate >= '2026-11-18').length;
    const totalRevenue = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
    const advanceCollections = bookings.reduce((acc, b) => acc + b.paidAmount, 0);
    const outstandingBalances = bookings.reduce((acc, b) => acc + b.remainingBalance, 0);
    const pendingPaymentsCount = bookings.filter((b) => b.remainingBalance > 0).length;

    return {
      totalBookings,
      upcomingShoots,
      totalRevenue,
      advanceCollections,
      outstandingBalances,
      pendingPaymentsCount,
    };
  }, [bookings]);

  const runAdminAction = async (action: string, payload: any, successText: string) => {
    setFeedback(null);
    setErrorMsg(null);
    try {
      const token = await getFreshToken();
      if (!token) throw new Error('Missing authentication token.');
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      setFeedback(successText);
      await loadAdminData();
      onCatalogRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (!firebaseUser) {
    return (
      <div className="p-10 rounded-2xl border border-stone-800 bg-[#121215] text-center space-y-4">
        <Shield className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-2xl font-serif text-stone-100">
          Studio Administrator Console
        </h3>
        <p className="text-sm text-stone-400 max-w-md mx-auto">
          Sign in with your Google account to access studio bookings, crew assignments, package pricing, and availability controls.
        </p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium inline-flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Sign In as Studio Administrator
        </button>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="p-10 rounded-2xl border border-stone-800 bg-[#121215] text-center space-y-4">
        <Shield className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-2xl font-serif text-stone-100">
          Studio Administrator Access Required
        </h3>
        <p className="text-sm text-stone-400 max-w-md mx-auto">
          Your account ({firebaseUser.email}) is currently in Customer Mode. Click below to elevate your session role to Studio Administrator in PostgreSQL.
        </p>
        <button
          type="button"
          onClick={async () => {
            await updateProfile({ role: 'admin' });
            await loadAdminData();
          }}
          className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium inline-flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Activate Studio Administrator Role
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-stone-800 bg-[#121215] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs text-amber-400 font-mono">
            MANISH CINEMATIC · STUDIO OPERATIONS & ADMIN SUITE
          </p>
          <h3 className="text-2xl font-serif text-stone-100 mt-0.5">
            Studio Operations, Revenue & Availability Control
          </h3>
        </div>

        {/* Sub-navigation */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-900 rounded-xl border border-stone-800">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
            { id: 'packages', label: `Packages (${packages.length})`, icon: Package },
            { id: 'availability', label: 'Availability', icon: Calendar },
            { id: 'gallery', label: 'Portfolio & Reviews', icon: ImageIcon },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-stone-800 bg-[#121215]">
              <span className="text-xs text-stone-400">Total Studio Bookings</span>
              <div className="font-mono text-2xl font-semibold text-stone-100 mt-1 tabular-nums">
                {metrics.totalBookings} Commissions
              </div>
              <span className="text-xs text-stone-400 mt-1 block">
                {metrics.upcomingShoots} Upcoming Shoots Scheduled
              </span>
            </div>

            <div className="p-5 rounded-xl border border-stone-800 bg-[#121215]">
              <span className="text-xs text-stone-400">Total Contracted Revenue</span>
              <div className="font-mono text-2xl font-semibold text-stone-100 mt-1 tabular-nums">
                {formatINR(metrics.totalRevenue)}
              </div>
              <span className="text-xs text-emerald-400 mt-1 block font-mono tabular-nums">
                Advance Collected: {formatINR(metrics.advanceCollections)}
              </span>
            </div>

            <div className="p-5 rounded-xl border border-stone-800 bg-[#121215]">
              <span className="text-xs text-stone-400">Outstanding Balances</span>
              <div className="font-mono text-2xl font-semibold text-amber-400 mt-1 tabular-nums">
                {formatINR(metrics.outstandingBalances)}
              </div>
              <span className="text-xs text-stone-400 mt-1 block">
                Across {metrics.pendingPaymentsCount} Active Bookings
              </span>
            </div>
          </div>

          {/* Recent Bookings Snapshot */}
          <div className="border border-stone-800 rounded-2xl bg-[#121215] p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-serif text-stone-100">Recent Studio Commissions</h4>
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className="text-xs text-amber-400 hover:underline"
              >
                Manage All Bookings →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Client & Event</th>
                    <th className="py-3 px-3">Date & City</th>
                    <th className="py-3 px-3">Assigned Crew</th>
                    <th className="py-3 px-3">Advance / Total</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {bookings.slice(0, 6).map((b) => (
                    <tr key={b.id} className="hover:bg-stone-900/40">
                      <td className="py-3 px-3 font-mono text-amber-300">{b.bookingCode}</td>
                      <td className="py-3 px-3">
                        <div className="text-stone-100 font-medium">{b.customerName}</div>
                        <div className="text-stone-400">{b.packageName}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-stone-300">
                        {b.eventDate} · {b.city}
                      </td>
                      <td className="py-3 px-3 text-stone-300">
                        <div>P: {b.assignedPhotographer}</div>
                        <div>V: {b.assignedVideographer}</div>
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums">
                        <span className="text-emerald-400">{formatINR(b.paidAmount)}</span> /{' '}
                        <span className="text-stone-200">{formatINR(b.totalAmount)}</span>
                      </td>
                      <td className="py-3 px-3 font-mono uppercase text-amber-300">
                        {b.bookingStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKING MANAGEMENT TAB */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-2xl border border-stone-800 bg-[#121215] space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <div className="text-xs font-mono text-stone-400">
                    {b.bookingCode} · Created {new Date(b.createdAt).toLocaleDateString()} · Status:{' '}
                    <span className="text-amber-400 uppercase">{b.bookingStatus}</span>
                  </div>
                  <h4 className="text-xl font-serif text-stone-100 mt-1">
                    {b.customerName} — {b.eventName} ({b.serviceName})
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {b.customerEmail} · {b.customerPhone} · Venue: {b.eventVenue}, {b.city} · Date:{' '}
                    <span className="font-mono text-stone-200">{b.eventDate}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      runAdminAction(
                        'update_booking',
                        {
                          bookingId: b.id,
                          updates: { bookingStatus: 'approved' },
                        },
                        `Booking ${b.bookingCode} approved.`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium"
                  >
                    Approve Shoot
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      runAdminAction(
                        'update_booking',
                        {
                          bookingId: b.id,
                          updates: {
                            paidAmount: b.totalAmount,
                            remainingBalance: 0,
                            paymentStatus: 'fully_paid',
                          },
                        },
                        `Marked ${b.bookingCode} as Fully Paid.`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium"
                  >
                    Confirm Full Balance Paid
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingBooking(b);
                      setEditPhotographer(b.assignedPhotographer || 'Aryan Verma');
                      setEditVideographer(b.assignedVideographer || 'Kabir Sen');
                      setEditStatus(b.bookingStatus);
                      setEditPaymentStatus(b.paymentStatus);
                      setEditPaidAmount(b.paidAmount);
                      setEditInternalNotes(b.internalNotes || '');
                      setEditEventDate(b.eventDate);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    Assign Crew / Edit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block">Package & Add-Ons</span>
                  <span className="text-stone-200">{b.packageName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Assigned Lead Photographer</span>
                  <span className="text-stone-200">{b.assignedPhotographer || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Assigned Cinema Director</span>
                  <span className="text-stone-200">{b.assignedVideographer || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Financial Ledger</span>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    Paid: {formatINR(b.paidAmount)}
                  </span>{' '}
                  ·{' '}
                  <span className="font-mono text-amber-300 tabular-nums">
                    Due: {formatINR(b.remainingBalance)}
                  </span>
                </div>
              </div>

              {b.rescheduleRequestedDate && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/60 text-xs text-amber-200 flex items-center justify-between">
                  <span>
                    Client requested reschedule to:{' '}
                    <strong className="font-mono">{b.rescheduleRequestedDate}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      runAdminAction(
                        'update_booking',
                        {
                          bookingId: b.id,
                          updates: {
                            eventDate: b.rescheduleRequestedDate,
                            bookingStatus: 'confirmed',
                            rescheduleRequestedDate: '',
                          },
                        },
                        `Approved reschedule for ${b.bookingCode}`
                      )
                    }
                    className="px-3 py-1 rounded bg-amber-600 text-white font-medium"
                  >
                    Approve New Date
                  </button>
                </div>
              )}

              {editingBooking?.id === b.id && (
                <div className="mt-4 p-5 rounded-xl bg-stone-900 border border-stone-700 space-y-4 text-xs">
                  <h5 className="text-sm font-serif text-stone-100">
                    Edit Crew Assignment, Schedule & Payment Ledger — {b.bookingCode}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-stone-400 mb-1">Lead Photographer</label>
                      <input
                        type="text"
                        value={editPhotographer}
                        onChange={(e) => setEditPhotographer(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-700 bg-stone-950 text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">Lead Cinematographer</label>
                      <input
                        type="text"
                        value={editVideographer}
                        onChange={(e) => setEditVideographer(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-700 bg-stone-950 text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">Event Date</label>
                      <input
                        type="date"
                        value={editEventDate}
                        onChange={(e) => setEditEventDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-700 bg-stone-950 text-stone-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-stone-400 mb-1">Booking Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-700 bg-stone-950 text-stone-100"
                      >
                        <option value="confirmed">confirmed</option>
                        <option value="approved">approved</option>
                        <option value="completed">completed</option>
                        <option value="reschedule_requested">reschedule_requested</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">Paid Amount (INR)</label>
                      <input
                        type="number"
                        value={editPaidAmount}
                        onChange={(e) => setEditPaidAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-stone-700 bg-stone-950 text-stone-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">Internal Producer Notes</label>
                      <input
                        type="text"
                        value={editInternalNotes}
                        onChange={(e) => setEditInternalNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-700 bg-stone-950 text-stone-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBooking(null)}
                      className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const newRemaining = Math.max(0, b.totalAmount - editPaidAmount);
                        await runAdminAction(
                          'update_booking',
                          {
                            bookingId: b.id,
                            updates: {
                              assignedPhotographer: editPhotographer,
                              assignedVideographer: editVideographer,
                              bookingStatus: editStatus,
                              paymentStatus: newRemaining === 0 ? 'fully_paid' : editPaymentStatus,
                              paidAmount: editPaidAmount,
                              remainingBalance: newRemaining,
                              internalNotes: editInternalNotes,
                              eventDate: editEventDate,
                            },
                          },
                          `Updated booking ${b.bookingCode}`
                        );
                        setEditingBooking(null);
                      }}
                      className="px-5 py-2 rounded-lg bg-amber-600 text-white font-medium"
                    >
                      Save Booking Updates
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. PACKAGE MANAGEMENT TAB */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl border border-stone-800 bg-[#121215] space-y-4 text-xs">
            <h4 className="text-lg font-serif text-stone-100">
              {pkgForm.id ? `Edit Package #${pkgForm.id}` : 'Create New Studio Package'}
            </h4>

            <div>
              <label className="block text-stone-400 mb-1">Service Category Slug</label>
              <select
                value={pkgForm.serviceSlug}
                onChange={(e) => setPkgForm({ ...pkgForm, serviceSlug: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
              >
                <option value="wedding-photography">wedding-photography</option>
                <option value="pre-wedding">pre-wedding</option>
                <option value="wedding-cinematography">wedding-cinematography</option>
                <option value="engagement">engagement</option>
                <option value="fashion-portfolio">fashion-portfolio</option>
                <option value="drone-videography">drone-videography</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">Package Name</label>
                <input
                  type="text"
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                  placeholder="e.g. Royal Palace Edition"
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
                />
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Price (INR)</label>
                <input
                  type="number"
                  value={pkgForm.price}
                  onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">Advance Type</label>
                <select
                  value={pkgForm.advanceType}
                  onChange={(e) => setPkgForm({ ...pkgForm, advanceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed INR</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Advance Value</label>
                <input
                  type="number"
                  value={pkgForm.advanceValue}
                  onChange={(e) => setPkgForm({ ...pkgForm, advanceValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Seasonal Offer %</label>
                <input
                  type="number"
                  value={pkgForm.seasonalDiscountPercent}
                  onChange={(e) =>
                    setPkgForm({ ...pkgForm, seasonalDiscountPercent: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-400 mb-1">Video Deliverables</label>
              <input
                type="text"
                value={pkgForm.videoDeliverables}
                onChange={(e) => setPkgForm({ ...pkgForm, videoDeliverables: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                if (!pkgForm.name.trim()) return;
                await runAdminAction(
                  'upsert_package',
                  {
                    ...pkgForm,
                    benefits: JSON.stringify(
                      pkgForm.benefits.split(',').map((s) => s.trim())
                    ),
                  },
                  `Saved package ${pkgForm.name}`
                );
                setPkgForm({ ...pkgForm, id: undefined, name: '' });
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium"
            >
              {pkgForm.id ? 'Update Package in PostgreSQL' : 'Create Package'}
            </button>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {packages.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-xl border border-stone-800 bg-[#121215] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-stone-400">
                    {p.serviceSlug} · {p.tier} · Advance:{' '}
                    {p.advanceType === 'percentage' ? `${p.advanceValue}%` : formatINR(p.advanceValue)} · Offer:{' '}
                    {p.seasonalDiscountPercent}% Off
                  </div>
                  <h5 className="text-lg font-serif text-stone-100">{p.name}</h5>
                  <div className="font-mono text-sm text-amber-400 tabular-nums mt-0.5">
                    {formatINR(p.price)} · {p.durationHours}h · {p.editedPhotosCount} Stills
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPkgForm({
                        id: p.id,
                        serviceSlug: p.serviceSlug,
                        name: p.name,
                        tier: p.tier,
                        price: p.price,
                        durationHours: p.durationHours,
                        photographersCount: p.photographersCount,
                        cinematographersCount: p.cinematographersCount,
                        editedPhotosCount: p.editedPhotosCount,
                        videoDeliverables: p.videoDeliverables,
                        albumIncluded: p.albumIncluded,
                        droneIncluded: p.droneIncluded,
                        benefits: p.benefits,
                        advanceType: p.advanceType,
                        advanceValue: p.advanceValue,
                        seasonalDiscountPercent: p.seasonalDiscountPercent,
                        imageUrl: p.imageUrl,
                        active: p.active,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900 text-xs text-stone-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runAdminAction(
                        'upsert_package',
                        { ...p, active: !p.active },
                        `Toggled package ${p.name}`
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      p.active
                        ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {p.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. AVAILABILITY MANAGEMENT TAB */}
      {activeTab === 'availability' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl border border-stone-800 bg-[#121215] space-y-4 text-xs">
            <h4 className="text-lg font-serif text-stone-100">
              Configure Date Availability & Multi-Team Capacity
            </h4>
            <div>
              <label className="block text-stone-400 mb-1">Target Date</label>
              <input
                type="date"
                value={slotForm.eventDate}
                onChange={(e) => setSlotForm({ ...slotForm, eventDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Status</label>
              <select
                value={slotForm.status}
                onChange={(e) => setSlotForm({ ...slotForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
              >
                <option value="available">Available (Open)</option>
                <option value="partially_booked">Partially Booked</option>
                <option value="booked">Fully Booked (Sold Out)</option>
                <option value="blocked">Blocked / Unavailable</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">Total Production Teams</label>
                <input
                  type="number"
                  value={slotForm.totalTeams}
                  onChange={(e) => setSlotForm({ ...slotForm, totalTeams: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Assigned / Booked Teams</label>
                <input
                  type="number"
                  value={slotForm.bookedTeams}
                  onChange={(e) => setSlotForm({ ...slotForm, bookedTeams: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Dispatch Notes</label>
              <input
                type="text"
                value={slotForm.notes}
                onChange={(e) => setSlotForm({ ...slotForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                runAdminAction(
                  'upsert_availability',
                  slotForm,
                  `Updated availability for ${slotForm.eventDate}`
                )
              }
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium"
            >
              Save Availability Rule
            </button>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {availabilitySlots.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-stone-800 bg-[#121215] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono text-sm text-stone-100 font-semibold">
                    {s.eventDate}
                  </span>
                  <span className="ml-3 uppercase font-mono text-amber-400">{s.status}</span>
                  <p className="text-stone-400 mt-0.5">{s.notes}</p>
                </div>
                <div className="font-mono text-stone-300 tabular-nums">
                  {s.bookedTeams} / {s.totalTeams} Teams Deployed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GALLERY & TESTIMONIAL MANAGEMENT TAB */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Add Portfolio Item */}
          <div className="p-6 rounded-2xl border border-stone-800 bg-[#121215] space-y-4">
            <h4 className="text-lg font-serif text-stone-100">Publish New Portfolio Work</h4>
            <div>
              <label className="block text-stone-400 mb-1">Project Title</label>
              <input
                type="text"
                value={galleryForm.title}
                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                placeholder="e.g. Royal Monsoon Vows — Udaivilas"
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">Category</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Pre-Wedding">Pre-Wedding</option>
                  <option value="Cinematography">Cinematography</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Drone">Drone</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Location</label>
                <input
                  type="text"
                  value={galleryForm.location}
                  onChange={(e) => setGalleryForm({ ...galleryForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Camera & Lens EXIF Metadata</label>
              <input
                type="text"
                value={galleryForm.exifMeta}
                onChange={(e) => setGalleryForm({ ...galleryForm, exifMeta: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!galleryForm.title.trim()) return;
                await runAdminAction(
                  'create_portfolio',
                  galleryForm,
                  `Added "${galleryForm.title}" to Portfolio.`
                );
                setGalleryForm({ ...galleryForm, title: '' });
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Publish Portfolio Showcase
            </button>

            <div className="pt-4 border-t border-stone-800 space-y-2">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-stone-900/70 border border-stone-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-stone-200 font-medium truncate">{item.title}</div>
                      <div className="text-stone-500">{item.category} · {item.location}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      runAdminAction(
                        'delete_portfolio',
                        { id: item.id },
                        `Removed portfolio item #${item.id}`
                      )
                    }
                    className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Client Testimonial */}
          <div className="p-6 rounded-2xl border border-stone-800 bg-[#121215] space-y-4">
            <h4 className="text-lg font-serif text-stone-100">Publish Verified Client Testimonial</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">Client Name</label>
                <input
                  type="text"
                  value={testimonialForm.clientName}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, clientName: e.target.value })
                  }
                  placeholder="e.g. Kabir & Natasha Oberoi"
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
                />
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Event Context</label>
                <input
                  type="text"
                  value={testimonialForm.clientRole}
                  onChange={(e) =>
                    setTestimonialForm({ ...testimonialForm, clientRole: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Quantitative Deliverable Outcome</label>
              <input
                type="text"
                value={testimonialForm.outcomeStat}
                onChange={(e) =>
                  setTestimonialForm({ ...testimonialForm, outcomeStat: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Client Quote</label>
              <textarea
                rows={3}
                value={testimonialForm.quote}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-800 bg-[#0d0d10] text-stone-100"
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!testimonialForm.clientName.trim() || !testimonialForm.quote.trim()) return;
                await runAdminAction(
                  'create_testimonial',
                  testimonialForm,
                  `Published testimonial from ${testimonialForm.clientName}`
                );
                setTestimonialForm({ ...testimonialForm, clientName: '', quote: '' });
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium"
            >
              Publish Testimonial
            </button>
          </div>
        </div>
      )}

      {/* 6. CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="border border-stone-800 rounded-2xl bg-[#121215] overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/80 text-stone-400">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Total Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/70">
              {users.map((u) => {
                const count = bookings.filter(
                  (b) => b.userUid === u.uid || b.customerEmail.toLowerCase() === u.email.toLowerCase()
                ).length;
                return (
                  <tr key={u.id} className="hover:bg-stone-900/40">
                    <td className="p-4 text-stone-100 font-medium">{u.name || 'Client'}</td>
                    <td className="p-4 font-mono text-stone-300">{u.email}</td>
                    <td className="p-4 font-mono text-stone-300">{u.phone || '—'}</td>
                    <td className="p-4 font-mono uppercase text-amber-400">{u.role}</td>
                    <td className="p-4 font-mono tabular-nums text-stone-200">{count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 7. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-stone-800 bg-[#121215] space-y-4">
            <h4 className="text-lg font-serif text-stone-100">Package Performance Breakdown</h4>
            <div className="space-y-3 text-xs">
              {packages.map((p) => {
                const pkgBookings = bookings.filter((b) => b.packageId === p.id);
                const pkgRev = pkgBookings.reduce((sum, b) => sum + b.totalAmount, 0);
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-stone-100 font-medium">{p.name}</div>
                      <div className="text-stone-400">{p.serviceSlug}</div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-amber-400">{formatINR(pkgRev)}</div>
                      <div className="text-stone-400">{pkgBookings.length} Bookings</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-stone-800 bg-[#121215] space-y-4">
            <h4 className="text-lg font-serif text-stone-100">Pending Balances Ledger</h4>
            <div className="space-y-3 text-xs">
              {bookings
                .filter((b) => b.remainingBalance > 0)
                .map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-stone-100 font-medium">
                        {b.customerName} ({b.bookingCode})
                      </div>
                      <div className="text-stone-400">
                        Event Date: {b.eventDate} · {b.city}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-amber-400 font-semibold">
                        Due: {formatINR(b.remainingBalance)}
                      </div>
                      <div className="text-emerald-400">Paid: {formatINR(b.paidAmount)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
