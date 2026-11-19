export interface StudioService {
  id: number;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  startingPrice: number;
  imageUrl: string;
  active: boolean;
}

export interface StudioPackage {
  id: number;
  serviceSlug: string;
  name: string;
  tier: string;
  price: number;
  durationHours: number;
  photographersCount: number;
  cinematographersCount: number;
  editedPhotosCount: number;
  videoDeliverables: string;
  albumIncluded: boolean;
  droneIncluded: boolean;
  benefits: string;
  advanceType: 'percentage' | 'fixed' | string;
  advanceValue: number;
  seasonalDiscountPercent: number;
  imageUrl: string;
  active: boolean;
}

export interface StudioAddon {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  active: boolean;
}

export interface AvailabilitySlot {
  id: number;
  eventDate: string;
  status: 'available' | 'partially_booked' | 'booked' | 'blocked' | string;
  totalTeams: number;
  bookedTeams: number;
  notes: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  location: string;
  mediaType: 'image' | 'video' | string;
  imageUrl: string;
  videoUrl: string;
  aspectRatio: string;
  exifMeta: string;
  featured: boolean;
}

export interface StudioTestimonial {
  id: number;
  clientName: string;
  clientRole: string;
  eventLocation: string;
  quote: string;
  outcomeStat: string;
  rating: number;
  featured: boolean;
}

export interface StudioBooking {
  id: number;
  bookingCode: string;
  userUid: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceSlug: string;
  serviceName: string;
  packageId: number;
  packageName: string;
  selectedAddons: string;
  eventFunctions: string;
  eventName: string;
  eventVenue: string;
  city: string;
  eventDate: string;
  eventEndDate: string;
  eventStartTime: string;
  eventDurationHours: number;
  specialInstructions: string;
  basePrice: number;
  addonsTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  advanceAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: string;
  bookingStatus: string;
  assignedPhotographer: string;
  assignedVideographer: string;
  internalNotes: string;
  rescheduleRequestedDate: string;
  cancellationReason: string;
  createdAt: string;
}

export interface StudioPayment {
  id: number;
  bookingId: number;
  bookingCode: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod: string;
  amount: number;
  status: string;
  receiptNumber: string;
  verifiedAt: string;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
