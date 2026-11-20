'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Download,
  MessageCircle,
  Mail,
  SlidersHorizontal,
  Plus,
  Minus,
  AlertCircle,
  Lock,
} from 'lucide-react';
import {
  StudioService,
  StudioPackage,
  StudioAddon,
  AvailabilitySlot,
  StudioBooking,
  StudioPayment,
  formatINR,
} from '@/src/types/studio';
import { ResilientImage } from './ResilientImage';
import { useAuth } from '@/src/context/AuthContext';

interface BookingWizardProps {
  services: StudioService[];
  packages: StudioPackage[];
  addons: StudioAddon[];
  availabilitySlots: AvailabilitySlot[];
  initialServiceSlug?: string;
  initialPackageId?: number;
  onBookingConfirmed: (booking: StudioBooking, payment: StudioPayment) => void;
  onOpenCustomerPortal: () => void;
}

const STEP_LABELS = [
  '01. Service',
  '02. Package',
  '03. Customize',
  '04. Date & Slot',
  '05. Event Details',
  '06. Summary',
  '07. Payment',
  '08. Confirmation',
];

const EVENT_FUNCTIONS_LIST = [
  'Engagement & Ring Ceremony',
  'Haldi Courtyard',
  'Mehendi & Sangeet',
  'Royal Wedding Ceremony',
  'Grand Reception',
  'Sunrise Couple Editorial',
  'After-Party & Gala',
];

const TIME_SLOTS = [
  '06:30 AM (Sunrise Golden Hour)',
  '10:00 AM (Morning Muhurat)',
  '04:00 PM (Twilight & Sunset)',
  '07:30 PM (Evening Reception)',
  'Full Day Multi-Shift',
];

export function BookingWizard({
  services,
  packages,
  addons,
  availabilitySlots,
  initialServiceSlug,
  initialPackageId,
  onBookingConfirmed,
  onOpenCustomerPortal,
}: BookingWizardProps) {
  const { firebaseUser, profile, getFreshToken } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>(
    initialServiceSlug || services[0]?.slug || 'wedding-photography'
  );

  // Filter packages matching service or fallback to core studio packages
  const availablePackages = useMemo(() => {
    const exact = packages.filter((p) => p.serviceSlug === selectedServiceSlug && p.active);
    if (exact.length > 0) return exact;
    return packages.filter((p) => p.active);
  }, [packages, selectedServiceSlug]);

  const [selectedPackageId, setSelectedPackageId] = useState<number>(
    initialPackageId || availablePackages[0]?.id || packages[0]?.id || 1
  );
  const [compareMode, setCompareMode] = useState<boolean>(false);

  // Add-ons state: map of addon slug -> quantity
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});

  // Step 4: Calendar & Date selection
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0); // 0 = Nov 2026, 1 = Dec 2026, 2 = Jan 2027
  const [selectedDate, setSelectedDate] = useState<string>('2026-12-19');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('2026-12-19');
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[1]);

  // Step 5: Customer & Event details
  const [customerName, setCustomerName] = useState<string>(profile?.name || firebaseUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(profile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState<string>(profile?.email || firebaseUser?.email || '');
  const [eventName, setEventName] = useState<string>('');
  const [eventVenue, setEventVenue] = useState<string>('');
  const [city, setCity] = useState<string>('Udaipur');
  const [eventDurationHours, setEventDurationHours] = useState<number>(8);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(['Royal Wedding Ceremony']);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Step 6 & 7: Pending booking + Razorpay server order
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [pendingBooking, setPendingBooking] = useState<StudioBooking | null>(null);
  const [razorpayOrder, setRazorpayOrder] = useState<{
    orderId: string;
    amountInPaise: number;
    currency: string;
    keyId: string;
    orderToken: string;
  } | null>(null);

  // Step 7: Payment Gateway inputs
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiVpa, setUpiVpa] = useState<string>('client@okhdfcbank');
  const [cardLast4, setCardLast4] = useState<string>('4592');
  const [bankName, setBankName] = useState<string>('HDFC Bank Private Wealth');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

  // Step 8: Confirmed booking & verified receipt
  const [confirmedBooking, setConfirmedBooking] = useState<StudioBooking | null>(null);
  const [verifiedPayment, setVerifiedPayment] = useState<StudioPayment | null>(null);
  const [showPrintableReceipt, setShowPrintableReceipt] = useState<boolean>(false);

  const selectedService = useMemo(
    () => services.find((s) => s.slug === selectedServiceSlug) || services[0],
    [services, selectedServiceSlug]
  );

  const selectedPackage = useMemo(
    () =>
      availablePackages.find((p) => p.id === selectedPackageId) ||
      availablePackages[0] ||
      packages[0],
    [availablePackages, packages, selectedPackageId]
  );

  // Live dynamic pricing calculation
  const pricing = useMemo(() => {
    const basePrice = selectedPackage?.price || 85000;
    const discountPercent = selectedPackage?.seasonalDiscountPercent || 0;
    const discountAmount = discountPercent > 0 ? Math.round((basePrice * discountPercent) / 100) : 0;

    let addonsTotal = 0;
    const chosenAddons: { addon: StudioAddon; quantity: number; lineTotal: number }[] = [];

    for (const addon of addons) {
      const qty = addonQuantities[addon.slug] || 0;
      if (qty > 0) {
        const lineTotal = addon.price * qty;
        addonsTotal += lineTotal;
        chosenAddons.push({ addon, quantity: qty, lineTotal });
      }
    }

    const taxableAmount = Math.max(0, basePrice - discountAmount + addonsTotal);
    const taxAmount = Math.round(taxableAmount * 0.18);
    const totalAmount = taxableAmount + taxAmount;

    const advanceType = selectedPackage?.advanceType || 'percentage';
    const advanceValue = selectedPackage?.advanceValue || 30;
    const advanceAmount =
      advanceType === 'fixed'
        ? Math.min(advanceValue, totalAmount)
        : Math.round((totalAmount * advanceValue) / 100);

    const remainingBalance = Math.max(0, totalAmount - advanceAmount);

    return {
      basePrice,
      discountPercent,
      discountAmount,
      addonsTotal,
      chosenAddons,
      taxAmount,
      totalAmount,
      advanceType,
      advanceValue,
      advanceAmount,
      remainingBalance,
    };
  }, [selectedPackage, addons, addonQuantities]);

  const slotMap = useMemo(() => {
    const map = new Map<string, AvailabilitySlot>();
    for (const slot of availabilitySlots) {
      map.set(slot.eventDate, slot);
    }
    return map;
  }, [availabilitySlots]);

  const calendarMonths = useMemo(() => {
    return [
      { year: 2026, month: 10, label: 'November 2026', daysInMonth: 30, startWeekday: 0 },
      { year: 2026, month: 11, label: 'December 2026', daysInMonth: 31, startWeekday: 2 },
      { year: 2027, month: 0, label: 'January 2027', daysInMonth: 31, startWeekday: 5 },
    ];
  }, []);

  const activeMonth = calendarMonths[currentMonthIndex];

  const handleAddonDelta = (slug: string, delta: number) => {
    setAddonQuantities((prev) => {
      const current = prev[slug] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [slug]: next };
    });
  };

  const toggleEventFunction = (fnName: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(fnName)
        ? prev.length > 1
          ? prev.filter((f) => f !== fnName)
          : prev
        : [...prev, fnName]
    );
  };

  const handleNextStep = () => {
    setValidationError(null);

    if (step === 4) {
      if (!selectedDate) {
        setValidationError('Please select an available event date on the calendar.');
        return;
      }
      const slot = slotMap.get(selectedDate);
      if (slot && (slot.status === 'booked' || slot.status === 'blocked' || slot.bookedTeams >= slot.totalTeams)) {
        setValidationError('This date is fully booked or unavailable. Please choose an available date.');
        return;
      }
    }

    if (step === 5) {
      const nameVal = customerName.trim() || profile?.name || firebaseUser?.displayName || '';
      const emailVal = customerEmail.trim() || profile?.email || firebaseUser?.email || '';
      const phoneVal = customerPhone.trim();
      const eventVal = eventName.trim();
      const venueVal = eventVenue.trim();

      if (!nameVal || !emailVal || !phoneVal || !eventVal || !venueVal) {
        setValidationError('Please fill in your full name, mobile number, email, event title, and venue.');
        return;
      }
      if (!emailVal.includes('@')) {
        setValidationError('Please enter a valid email address for receipt delivery.');
        return;
      }
      if (phoneVal.replace(/\D/g, '').length < 10) {
        setValidationError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    setStep((prev) => Math.min(8, prev + 1));
  };

  const handleCreatePendingBookingAndProceed = async () => {
    setValidationError(null);
    setIsSubmittingBooking(true);
    try {
      const token = await getFreshToken();
      const selectedAddonsPayload = Object.entries(addonQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([slug, quantity]) => ({ slug, quantity }));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerName: customerName.trim() || profile?.name || firebaseUser?.displayName || 'Valued Client',
          customerEmail: customerEmail.trim() || profile?.email || firebaseUser?.email || 'client@example.com',
          customerPhone: customerPhone.trim(),
          serviceSlug: selectedService.slug,
          packageId: selectedPackage.id,
          selectedAddons: selectedAddonsPayload,
          eventFunctions: selectedFunctions,
          eventName: eventName.trim(),
          eventVenue: eventVenue.trim(),
          city: city.trim(),
          eventDate: selectedDate,
          eventEndDate: isMultiDay ? selectedEndDate : selectedDate,
          eventStartTime: selectedTimeSlot,
          eventDurationHours,
          specialInstructions: specialInstructions.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not reserve booking slot.');
      }

      setPendingBooking(data.booking);
      setRazorpayOrder(data.razorpayOrder);
      setStep(7);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to lock booking slot.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleVerifyRazorpayPayment = async () => {
    if (!pendingBooking || !razorpayOrder) return;
    setValidationError(null);
    setIsVerifyingPayment(true);

    try {
      const identifier =
        paymentMethod === 'UPI'
          ? upiVpa
          : paymentMethod === 'Card'
          ? `Card ending ${cardLast4}`
          : bankName;

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: pendingBooking.id,
          bookingCode: pendingBooking.bookingCode,
          razorpayOrderId: razorpayOrder.orderId,
          paymentMethod,
          advanceAmount: pendingBooking.advanceAmount,
          orderToken: razorpayOrder.orderToken,
          upiOrCardIdentifier: identifier,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.verified) {
        throw new Error(data.error || 'Payment verification failed on server.');
      }

      setConfirmedBooking(data.booking);
      setVerifiedPayment(data.payment);
      onBookingConfirmed(data.booking, data.payment);
      setStep(8);
    } catch (err: any) {
      setValidationError(err.message || 'Gateway verification error.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  return (
    <div className="bg-[#29050E] border border-stone-800/80 rounded-2xl overflow-hidden">
      {/* Progress Indicator Header */}
      <div className="border-b border-stone-800/80 bg-[#22040B] px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs text-stone-400 tracking-wide">
              Interactive Studio Commission Wizard · Real-Time PostgreSQL Availability Lock
            </p>
            <h3 className="text-2xl font-serif text-stone-100 mt-0.5">
              {STEP_LABELS[step - 1]}
            </h3>
          </div>

          {/* Live Running Price Summary Bar */}
          {step < 8 && (
            <div className="flex items-center gap-6 text-sm border border-stone-800 bg-stone-900/60 px-4 py-2.5 rounded-xl">
              <div>
                <span className="text-xs text-stone-400 block">Estimated Total (incl. GST)</span>
                <span className="font-mono text-base font-medium text-stone-100 tabular-nums">
                  {formatINR(pricing.totalAmount)}
                </span>
              </div>
              <div className="h-7 w-px bg-stone-800" />
              <div>
                <span className="text-xs text-amber-400/90 block">
                  Advance ({pricing.advanceType === 'percentage' ? `${pricing.advanceValue}%` : 'Fixed'})
                </span>
                <span className="font-mono text-base font-semibold text-amber-400 tabular-nums">
                  {formatINR(pricing.advanceAmount)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 8-Step Horizontal Progress Track */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-5">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <button
                key={label}
                type="button"
                disabled={stepNum > step || step === 8}
                onClick={() => {
                  if (stepNum < step && step < 8) setStep(stepNum);
                }}
                className={`text-left px-2.5 py-2 rounded-lg border transition-all ${
                  isActive
                    ? 'border-amber-500/80 bg-amber-500/10 text-amber-300'
                    : isDone
                    ? 'border-stone-700 bg-stone-900/70 text-stone-300 hover:border-stone-600 cursor-pointer'
                    : 'border-stone-800/60 bg-stone-950/40 text-stone-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="truncate">{label}</span>
                  {isDone && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Wizard Body */}
      <div className="p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT YOUR SERVICE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-6">
                <h4 className="text-xl font-serif text-stone-100">
                  Select Your Photography or Cinematography Discipline
                </h4>
                <p className="text-sm text-stone-400 mt-1">
                  Choose the primary production category for your commission. Additional ceremonies and sessions can be layered in Step 3 and Step 5.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((svc) => {
                  const isSelected = svc.slug === selectedServiceSlug;
                  return (
                    <button
                      key={svc.slug}
                      type="button"
                      onClick={() => {
                        setSelectedServiceSlug(svc.slug);
                        const matchingPkgs = packages.filter((p) => p.serviceSlug === svc.slug && p.active);
                        if (matchingPkgs.length > 0) {
                          setSelectedPackageId(matchingPkgs[0].id);
                        }
                      }}
                      className={`group text-left rounded-xl overflow-hidden border transition-all flex flex-col ${
                        isSelected
                          ? 'border-amber-500 bg-stone-900/90 shadow-lg'
                          : 'border-stone-800/80 bg-[#22040B] hover:border-stone-700'
                      }`}
                    >
                      <div className="relative h-44 w-full overflow-hidden">
                        <ResilientImage
                          src={svc.imageUrl}
                          alt={svc.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-stone-300">
                          <span>{svc.category}</span>
                          <span className="font-mono text-amber-300 tabular-nums">
                            From {formatINR(svc.startingPrice)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-lg font-serif text-stone-100">{svc.name}</h5>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                            {svc.shortDescription}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: SELECT YOUR PACKAGE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-xl font-serif text-stone-100">
                    Select Your Production Package for {selectedService?.name}
                  </h4>
                  <p className="text-sm text-stone-400 mt-1">
                    All packages include colour-calibrated archival delivery and dedicated production leads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompareMode((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-xs font-medium text-stone-200 transition-colors whitespace-nowrap shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  {compareMode ? 'Card View' : 'Compare Packages Matrix'}
                </button>
              </div>

              {compareMode ? (
                <div className="overflow-x-auto border border-stone-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-stone-800 bg-stone-900/80">
                        <th className="p-4 text-xs font-medium text-stone-400">Specification</th>
                        {availablePackages.map((pkg) => (
                          <th key={pkg.id} className="p-4 min-w-[220px]">
                            <div className="text-xs text-amber-400">{pkg.tier}</div>
                            <div className="font-serif text-lg text-stone-100">{pkg.name}</div>
                            <div className="font-mono text-base text-stone-200 mt-1 tabular-nums">
                              {formatINR(pkg.price)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/70 text-xs">
                      <tr>
                        <td className="p-4 text-stone-400">Shooting Duration</td>
                        {availablePackages.map((pkg) => (
                          <td key={pkg.id} className="p-4 font-mono tabular-nums text-stone-200">
                            {pkg.durationHours} Hours
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-stone-400">Crew Strength</td>
                        {availablePackages.map((pkg) => (
                          <td key={pkg.id} className="p-4 text-stone-200">
                            {pkg.photographersCount} Photographers · {pkg.cinematographersCount} Cinematographers
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-stone-400">Edited Archival Stills</td>
                        {availablePackages.map((pkg) => (
                          <td key={pkg.id} className="p-4 font-mono tabular-nums text-stone-200">
                            {pkg.editedPhotosCount} Fine-Art Frames
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-stone-400">Cinema Deliverables</td>
                        {availablePackages.map((pkg) => (
                          <td key={pkg.id} className="p-4 text-stone-200">{pkg.videoDeliverables}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-stone-400">Linen Album & Drone</td>
                        {availablePackages.map((pkg) => (
                          <td key={pkg.id} className="p-4 text-stone-200">
                            Album: {pkg.albumIncluded ? 'Included' : 'Optional'} · Drone:{' '}
                            {pkg.droneIncluded ? 'Included' : 'Optional'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-stone-400">Selection</td>
                        {availablePackages.map((pkg) => (
                          <td key={pkg.id} className="p-4">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPackageId(pkg.id);
                                setEventDurationHours(pkg.durationHours);
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                selectedPackageId === pkg.id
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                              }`}
                            >
                              {selectedPackageId === pkg.id ? 'Selected Package' : 'Select Package'}
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {availablePackages.map((pkg) => {
                    const isSelected = pkg.id === selectedPackage.id;
                    let benefitsList: string[] = [];
                    try {
                      benefitsList = JSON.parse(pkg.benefits);
                    } catch {
                      benefitsList = [pkg.benefits];
                    }

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          setSelectedPackageId(pkg.id);
                          setEventDurationHours(pkg.durationHours);
                        }}
                        className={`cursor-pointer rounded-xl border p-6 flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-stone-900/90'
                            : 'border-stone-800 bg-[#22040B] hover:border-stone-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-stone-400">
                            <span>{pkg.tier} Edition</span>
                            {pkg.seasonalDiscountPercent > 0 && (
                              <span className="text-amber-400 font-mono">
                                {pkg.seasonalDiscountPercent}% Seasonal Offer
                              </span>
                            )}
                          </div>
                          <h5 className="text-2xl font-serif text-stone-100 mt-1">{pkg.name}</h5>
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-semibold text-stone-100 tabular-nums">
                              {formatINR(pkg.price)}
                            </span>
                            <span className="text-xs text-stone-400">+ 18% GST</span>
                          </div>

                          <div className="mt-5 pt-4 border-t border-stone-800/80 space-y-2.5 text-xs text-stone-300">
                            <div className="flex justify-between">
                              <span className="text-stone-400">Duration</span>
                              <span className="font-mono tabular-nums">{pkg.durationHours} Hours</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Photographers</span>
                              <span className="font-mono tabular-nums">{pkg.photographersCount} Senior Stills</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Cinematographers</span>
                              <span className="font-mono tabular-nums">{pkg.cinematographersCount} Cinema Ops</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Edited Photographs</span>
                              <span className="font-mono tabular-nums">{pkg.editedPhotosCount}+ Stills</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Heirloom Album</span>
                              <span>{pkg.albumIncluded ? 'Included' : 'Customizable Add-On'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Aerial Drone</span>
                              <span>{pkg.droneIncluded ? 'Included' : 'Customizable Add-On'}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-stone-800/80">
                            <p className="text-xs text-stone-400 mb-1">Film Deliverables:</p>
                            <p className="text-xs text-stone-200 font-medium">{pkg.videoDeliverables}</p>
                          </div>

                          <ul className="mt-4 space-y-2">
                            {benefitsList.map((b, i) => (
                              <li key={i} className="text-xs text-stone-400 flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          className={`mt-6 w-full py-2.5 px-4 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                          }`}
                        >
                          {isSelected ? 'Selected Package' : 'Choose Package'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: CUSTOMIZE YOUR BOOKING */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-6">
                <h4 className="text-xl font-serif text-stone-100">
                  Customize Your Production & Deliverables
                </h4>
                <p className="text-sm text-stone-400 mt-1">
                  Tailor your crew size, cinema films, archival albums, and express turnaround options. Total price updates dynamically.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addons.map((addon) => {
                  const qty = addonQuantities[addon.slug] || 0;
                  return (
                    <div
                      key={addon.slug}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        qty > 0
                          ? 'border-amber-500/80 bg-stone-900/90'
                          : 'border-stone-800/80 bg-[#22040B]'
                      }`}
                    >
                      <div className="min-w-0">
                        <h5 className="text-sm font-medium text-stone-100">{addon.name}</h5>
                        <p className="text-xs text-stone-400 mt-0.5">{addon.description}</p>
                        <div className="mt-2 text-xs font-mono text-amber-400 tabular-nums">
                          {formatINR(addon.price)} <span className="text-stone-500">· {addon.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAddonDelta(addon.slug, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-lg border border-stone-700 bg-stone-900 flex items-center justify-center text-stone-300 hover:bg-stone-800 disabled:opacity-40"
                          aria-label={`Decrease ${addon.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono text-sm text-stone-100 tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddonDelta(addon.slug, 1)}
                          className="w-8 h-8 rounded-lg border border-stone-700 bg-stone-900 flex items-center justify-center text-stone-200 hover:bg-stone-800"
                          aria-label={`Increase ${addon.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: SELECT EVENT DATE */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-serif text-stone-100">
                        Select Event Date & Production Slot
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Live availability validated against our 3 production units.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentMonthIndex === 0}
                        onClick={() => setCurrentMonthIndex((i) => Math.max(0, i - 1))}
                        className="p-2 rounded-lg border border-stone-800 bg-stone-900 text-stone-300 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-stone-200 min-w-[130px] text-center">
                        {activeMonth.label}
                      </span>
                      <button
                        type="button"
                        disabled={currentMonthIndex === calendarMonths.length - 1}
                        onClick={() =>
                          setCurrentMonthIndex((i) => Math.min(calendarMonths.length - 1, i + 1))
                        }
                        className="p-2 rounded-lg border border-stone-800 bg-stone-900 text-stone-300 disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="border border-stone-800 rounded-xl bg-[#22040B] p-4">
                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-stone-500 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className="py-1 font-medium">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: activeMonth.startWeekday }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="h-14" />
                      ))}
                      {Array.from({ length: activeMonth.daysInMonth }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const mm = String(activeMonth.month + 1).padStart(2, '0');
                        const dd = String(dayNum).padStart(2, '0');
                        const isoDate = `${activeMonth.year}-${mm}-${dd}`;
                        const slot = slotMap.get(isoDate);

                        const isBlocked = slot?.status === 'blocked';
                        const isBooked =
                          slot?.status === 'booked' ||
                          (slot && slot.bookedTeams >= slot.totalTeams);
                        const isPartial = slot?.status === 'partially_booked' && !isBooked;
                        const isDisabled = isBlocked || isBooked;
                        const isSelected = selectedDate === isoDate;

                        return (
                          <button
                            key={isoDate}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedDate(isoDate);
                              if (!isMultiDay || selectedEndDate < isoDate) {
                                setSelectedEndDate(isoDate);
                              }
                              setValidationError(null);
                            }}
                            className={`h-14 rounded-lg border p-1.5 flex flex-col justify-between text-left transition-all ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500/20 text-stone-100'
                                : isBlocked
                                ? 'border-stone-900 bg-stone-950/80 text-stone-600 cursor-not-allowed'
                                : isBooked
                                ? 'border-rose-950/80 bg-rose-950/25 text-rose-400/60 cursor-not-allowed'
                                : isPartial
                                ? 'border-amber-900/60 bg-amber-950/20 text-stone-200 hover:border-amber-600'
                                : 'border-stone-800/80 bg-stone-900/40 text-stone-200 hover:border-stone-600'
                            }`}
                          >
                            <span className="font-mono text-xs tabular-nums">{dayNum}</span>
                            <span className="text-[10px] leading-tight truncate">
                              {isBlocked
                                ? 'Blocked'
                                : isBooked
                                ? 'Sold Out'
                                : isPartial
                                ? `${(slot?.totalTeams || 3) - (slot?.bookedTeams || 1)} Unit Left`
                                : 'Open'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-5 text-xs text-stone-400">
                      <span>Open: 3 Units Available</span>
                      <span>·</span>
                      <span className="text-amber-300">1–2 Units Left: High Demand</span>
                      <span>·</span>
                      <span className="text-rose-400/80">Sold Out / Fully Booked</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Time Slot & Multi-Day Controls */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="p-5 rounded-xl border border-stone-800 bg-[#22040B]">
                    <h5 className="text-base font-serif text-stone-100">Selected Shoot Schedule</h5>
                    <div className="mt-3 p-3 rounded-lg bg-stone-900/90 border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CalendarIcon className="w-4 h-4 text-amber-400" />
                        <span className="font-mono text-sm text-stone-100">{selectedDate}</span>
                      </div>
                      <span className="text-xs text-emerald-400">Available</span>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMultiDay}
                          onChange={(e) => setIsMultiDay(e.target.checked)}
                          className="rounded border-stone-700 bg-stone-900 text-amber-600"
                        />
                        <span>Multi-Day Destination / Wedding Commission</span>
                      </label>

                      {isMultiDay && (
                        <div className="mt-3">
                          <label className="block text-xs text-stone-400 mb-1">
                            Conclusion Date
                          </label>
                          <input
                            type="date"
                            value={selectedEndDate}
                            min={selectedDate}
                            onChange={(e) => setSelectedEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-stone-700 bg-stone-900 text-sm text-stone-100 font-mono"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <label className="block text-xs text-stone-400 mb-2">
                        Primary Call-Time & Lighting Window
                      </label>
                      <div className="space-y-2">
                        {TIME_SLOTS.map((slotLabel) => (
                          <button
                            key={slotLabel}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slotLabel)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                              selectedTimeSlot === slotLabel
                                ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                                : 'border-stone-800 bg-stone-900/50 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              {slotLabel}
                            </span>
                            {selectedTimeSlot === slotLabel && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: EVENT DETAILS */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-6">
                <h4 className="text-xl font-serif text-stone-100">
                  Client & Event Production Details
                </h4>
                <p className="text-sm text-stone-400 mt-1">
                  Provide your contact coordinates, venue location, and the ceremonies to be covered.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1.5">Your Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Aarav & Mira Singhania"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1.5">Mobile Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98200 55100"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="client@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1.5">Event Title / Couple Name *</label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g. The Suryagarh Palace Wedding"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1.5">Venue / Hotel / Estate *</label>
                      <input
                        type="text"
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        placeholder="e.g. Taj Lake Palace"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1.5">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Udaipur, Mumbai, Jaipur..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-stone-400 mb-2">
                      Select Event Functions Included in Shoot
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {EVENT_FUNCTIONS_LIST.map((fn) => {
                        const active = selectedFunctions.includes(fn);
                        return (
                          <button
                            key={fn}
                            type="button"
                            onClick={() => toggleEventFunction(fn)}
                            className={`px-3 py-2 rounded-lg border text-xs text-left flex items-center justify-between transition-colors ${
                              active
                                ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                                : 'border-stone-800 bg-[#22040B] text-stone-400 hover:border-stone-700'
                            }`}
                          >
                            <span className="truncate">{fn}</span>
                            {active && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-400 mb-1.5">
                      Special Lighting, Aesthetic Notes or Key Family Instructions
                    </label>
                    <textarea
                      rows={4}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Share moodboard links, preferred film stock aesthetics, drone clearance details, or VIP family protocol..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-800 bg-[#22040B] text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: PRICE SUMMARY */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-5">
                  <h4 className="text-xl font-serif text-stone-100">
                    Commission Specifications & Breakdown
                  </h4>
                  <div className="p-5 rounded-xl border border-stone-800 bg-[#22040B] space-y-4 text-sm">
                    <div className="flex justify-between pb-3 border-b border-stone-800/80">
                      <div>
                        <span className="text-xs text-stone-400 block">Selected Service</span>
                        <span className="font-serif text-lg text-stone-100">{selectedService?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">Event Schedule</span>
                        <span className="font-mono text-xs text-stone-200">
                          {selectedDate} {isMultiDay && selectedEndDate !== selectedDate ? `to ${selectedEndDate}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pb-3 border-b border-stone-800/80">
                      <div>
                        <span className="text-xs text-stone-400 block">Client & Location</span>
                        <span className="text-stone-200">{customerName} · {eventName}</span>
                        <span className="text-xs text-stone-400 block mt-0.5">
                          <MapPin className="w-3 h-3 inline mr-1 text-amber-400" />
                          {eventVenue}, {city}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">Functions</span>
                        <span className="text-xs text-stone-300">{selectedFunctions.join(' · ')}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-stone-400 block mb-2">Package & Add-Ons</span>
                      <div className="flex justify-between text-stone-200 py-1">
                        <span>{selectedPackage?.name} ({selectedPackage?.durationHours} hrs)</span>
                        <span className="font-mono tabular-nums">{formatINR(pricing.basePrice)}</span>
                      </div>
                      {pricing.chosenAddons.map(({ addon, quantity, lineTotal }) => (
                        <div key={addon.slug} className="flex justify-between text-xs text-stone-300 py-1">
                          <span>
                            + {addon.name} × {quantity}
                          </span>
                          <span className="font-mono tabular-nums">{formatINR(lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Financial Summary Card */}
                <div className="lg:col-span-5">
                  <div className="p-6 rounded-xl border border-amber-500/40 bg-stone-900/90 space-y-3 text-sm">
                    <h5 className="text-lg font-serif text-stone-100 pb-2 border-b border-stone-800">
                      Investment & Advance Summary
                    </h5>

                    <div className="flex justify-between text-stone-300">
                      <span>Base Package Price</span>
                      <span className="font-mono tabular-nums">{formatINR(pricing.basePrice)}</span>
                    </div>

                    {pricing.addonsTotal > 0 && (
                      <div className="flex justify-between text-stone-300">
                        <span>Custom Add-Ons Total</span>
                        <span className="font-mono tabular-nums">{formatINR(pricing.addonsTotal)}</span>
                      </div>
                    )}

                    {pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Seasonal Offer ({pricing.discountPercent}% Off)</span>
                        <span className="font-mono tabular-nums">-{formatINR(pricing.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-400 text-xs">
                      <span>GST (18% Commercial Production Tax)</span>
                      <span className="font-mono tabular-nums">{formatINR(pricing.taxAmount)}</span>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex justify-between text-base font-semibold text-stone-100">
                      <span>Total Booking Amount</span>
                      <span className="font-mono tabular-nums">{formatINR(pricing.totalAmount)}</span>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/40 mt-4 space-y-2">
                      <div className="flex justify-between text-amber-300 font-medium">
                        <span>
                          Advance Retainer (
                          {pricing.advanceType === 'percentage'
                            ? `${pricing.advanceValue}%`
                            : 'Fixed'}
                          ) — Pay Now
                        </span>
                        <span className="font-mono text-lg font-bold tabular-nums">
                          {formatINR(pricing.advanceAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-stone-300">
                        <span>Remaining Balance (Due on Event Week)</span>
                        <span className="font-mono tabular-nums">{formatINR(pricing.remainingBalance)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingBooking}
                      onClick={handleCreatePendingBookingAndProceed}
                      className="mt-4 w-full py-3 px-5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      {isSubmittingBooking
                        ? 'Locking Availability & Creating Razorpay Order...'
                        : `Proceed to Razorpay Advance (${formatINR(pricing.advanceAmount)})`}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 7: ADVANCE PAYMENT (RAZORPAY GATEWAY) */}
          {step === 7 && pendingBooking && razorpayOrder && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="max-w-3xl mx-auto">
                <div className="p-6 rounded-2xl border border-stone-700 bg-[#22040B]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-stone-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-stone-400">
                          Razorpay Secure Checkout · HMAC-SHA256 Verified
                        </div>
                        <h4 className="text-lg font-display italic text-stone-100">
                          Manish Cinematic Studio Productions
                        </h4>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-stone-400 block font-mono">
                        Order: {razorpayOrder.orderId}
                      </span>
                      <span className="font-mono text-xl font-bold text-amber-400 tabular-nums">
                        {formatINR(pendingBooking.advanceAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-3 my-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                        paymentMethod === 'UPI'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>UPI / GPay / PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-3.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                        paymentMethod === 'Card'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit / Debit Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NetBanking')}
                      className={`p-3.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                        paymentMethod === 'NetBanking'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Net Banking / RTGS</span>
                    </button>
                  </div>

                  {/* Method Specific Details */}
                  <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 mb-6">
                    {paymentMethod === 'UPI' && (
                      <div>
                        <label className="block text-xs text-stone-400 mb-1.5">
                          Enter UPI ID (VPA) for Instant Collect Request
                        </label>
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-700 bg-stone-950 text-sm text-stone-100 font-mono"
                        />
                        <p className="text-xs text-stone-500 mt-2">
                          Supports BHIM, Google Pay, PhonePe, Paytm & all NPCI UPI handles.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'Card' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-stone-400 mb-1.5">
                            Card Last 4 Digits (Tokenized Visa / Mastercard / Amex / RuPay)
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            value={cardLast4}
                            onChange={(e) => setCardLast4(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-700 bg-stone-950 text-sm text-stone-100 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'NetBanking' && (
                      <div>
                        <label className="block text-xs text-stone-400 mb-1.5">
                          Select Preferred Indian Bank
                        </label>
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-700 bg-stone-950 text-sm text-stone-100"
                        >
                          <option value="HDFC Bank Private Wealth">HDFC Bank Private Wealth</option>
                          <option value="ICICI Bank Corporate">ICICI Bank</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="Axis Bank Burgundy">Axis Bank Burgundy</option>
                          <option value="Kotak Mahindra Privy">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isVerifyingPayment}
                    onClick={handleVerifyRazorpayPayment}
                    className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isVerifyingPayment
                      ? 'Verifying HMAC-SHA256 Signature with Server...'
                      : `Authorize & Verify Advance Payment (${formatINR(pendingBooking.advanceAmount)})`}
                  </button>

                  <p className="text-center text-xs text-stone-500 mt-3">
                    Booking ID {pendingBooking.bookingCode} remains in pending state until cryptographic server verification completes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 8: BOOKING CONFIRMATION */}
          {step === 8 && confirmedBooking && verifiedPayment && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/15 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-emerald-400 font-mono">
                    PAYMENT VERIFIED · AVAILABILITY LOCKED
                  </p>
                  <h4 className="text-3xl font-serif text-stone-100 mt-1">
                    Commission Confirmed — {confirmedBooking.bookingCode}
                  </h4>
                  <p className="text-sm text-stone-300 mt-2">
                    An official confirmation and tax receipt ({verifiedPayment.receiptNumber}) have been dispatched to{' '}
                    <span className="text-stone-100 font-medium">{confirmedBooking.customerEmail}</span>.
                  </p>
                </div>

                {/* Official Receipt & Event Ledger */}
                <div className="p-6 rounded-2xl border border-stone-800 bg-[#22040B] space-y-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-800">
                    <div>
                      <span className="text-xs text-stone-400 block">Receipt Number</span>
                      <span className="font-mono text-stone-100">{verifiedPayment.receiptNumber}</span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Razorpay Payment ID</span>
                      <span className="font-mono text-stone-200">{verifiedPayment.razorpayPaymentId}</span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Payment Method</span>
                      <span className="text-stone-200">{verifiedPayment.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                    <div>
                      <span className="text-xs text-stone-400 block">Event & Service</span>
                      <span className="text-stone-100 font-medium">
                        {confirmedBooking.eventName} · {confirmedBooking.serviceName}
                      </span>
                      <span className="text-xs text-stone-400 block mt-0.5">
                        Package: {confirmedBooking.packageName}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Date & Venue</span>
                      <span className="text-stone-100 font-mono">{confirmedBooking.eventDate}</span>
                      <span className="text-xs text-stone-400 block mt-0.5">
                        {confirmedBooking.eventVenue}, {confirmedBooking.city}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs text-stone-400 block">Total Contract</span>
                      <span className="font-mono text-base text-stone-200 tabular-nums">
                        {formatINR(confirmedBooking.totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-emerald-400 block">Paid Advance</span>
                      <span className="font-mono text-base font-semibold text-emerald-400 tabular-nums">
                        {formatINR(confirmedBooking.paidAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-amber-400 block">Remaining Balance</span>
                      <span className="font-mono text-base text-amber-300 tabular-nums">
                        {formatINR(confirmedBooking.remainingBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPrintableReceipt((prev) => !prev)}
                        className="px-4 py-2.5 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-xs font-medium text-stone-200 inline-flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        {showPrintableReceipt ? 'Hide Printable Receipt' : 'View / Print Official Receipt'}
                      </button>

                      <a
                        href={`https://wa.me/918210057153?text=${encodeURIComponent(
                          `Hello Manish Cinematic, my booking ${confirmedBooking.bookingCode} for ${confirmedBooking.eventDate} is confirmed.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-lg border border-emerald-700/70 bg-emerald-950/40 hover:bg-emerald-900/50 text-xs font-medium text-emerald-300 inline-flex items-center gap-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Manish Cinematic
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenCustomerPortal}
                      className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium inline-flex items-center gap-2"
                    >
                      Open Client Dashboard
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {showPrintableReceipt && (
                    <div className="mt-4 p-5 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-stone-300 space-y-2">
                      <div className="flex justify-between text-stone-100 font-bold border-b border-stone-800 pb-2">
                        <span>MANISH CINEMATIC — OFFICIAL TAX & ADVANCE RECEIPT</span>
                        <span>{verifiedPayment.receiptNumber}</span>
                      </div>
                      <p>Booking Code: {confirmedBooking.bookingCode}</p>
                      <p>Client: {confirmedBooking.customerName} ({confirmedBooking.customerEmail})</p>
                      <p>Gateway Order ID: {verifiedPayment.razorpayOrderId}</p>
                      <p>Gateway Payment ID: {verifiedPayment.razorpayPaymentId}</p>
                      <p>HMAC Signature (Truncated): {verifiedPayment.razorpaySignature.slice(0, 32)}...</p>
                      <p>Advance Paid: {formatINR(confirmedBooking.paidAmount)} · Balance Due: {formatINR(confirmedBooking.remainingBalance)}</p>
                      <div className="pt-2 flex items-center gap-2 text-emerald-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Confirmation Email Dispatched to {confirmedBooking.customerEmail}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Wizard Navigation Bar (Steps 1–6) */}
        {step < 7 && (
          <div className="mt-8 pt-5 border-t border-stone-800/80 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => {
                setValidationError(null);
                setStep((prev) => Math.max(1, prev - 1));
              }}
              className="px-4 py-2.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-xs font-medium text-stone-300 inline-flex items-center gap-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Step
            </button>

            {step < 6 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
              >
                Continue to {STEP_LABELS[step]}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
