import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').default(''),
  phone: text('phone').default(''),
  role: text('role').notNull().default('customer'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  shortDescription: text('short_description').notNull(),
  startingPrice: integer('starting_price').notNull(),
  imageUrl: text('image_url').notNull(),
  active: boolean('active').notNull().default(true),
});

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  serviceSlug: text('service_slug').notNull(),
  name: text('name').notNull(),
  tier: text('tier').notNull(),
  price: integer('price').notNull(),
  durationHours: integer('duration_hours').notNull(),
  photographersCount: integer('photographers_count').notNull(),
  cinematographersCount: integer('cinematographers_count').notNull(),
  editedPhotosCount: integer('edited_photos_count').notNull(),
  videoDeliverables: text('video_deliverables').notNull(),
  albumIncluded: boolean('album_included').notNull().default(false),
  droneIncluded: boolean('drone_included').notNull().default(false),
  benefits: text('benefits').notNull(),
  advanceType: text('advance_type').notNull().default('percentage'),
  advanceValue: integer('advance_value').notNull().default(30),
  seasonalDiscountPercent: integer('seasonal_discount_percent').notNull().default(0),
  imageUrl: text('image_url').notNull(),
  active: boolean('active').notNull().default(true),
});

export const addons = pgTable('addons', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  unit: text('unit').notNull(),
  active: boolean('active').notNull().default(true),
});

export const availabilitySlots = pgTable('availability_slots', {
  id: serial('id').primaryKey(),
  eventDate: text('event_date').notNull().unique(),
  status: text('status').notNull().default('available'),
  totalTeams: integer('total_teams').notNull().default(3),
  bookedTeams: integer('booked_teams').notNull().default(0),
  notes: text('notes').default(''),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingCode: text('booking_code').notNull().unique(),
  userUid: text('user_uid').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  serviceSlug: text('service_slug').notNull(),
  serviceName: text('service_name').notNull(),
  packageId: integer('package_id').notNull(),
  packageName: text('package_name').notNull(),
  selectedAddons: text('selected_addons').notNull(),
  eventFunctions: text('event_functions').notNull(),
  eventName: text('event_name').notNull(),
  eventVenue: text('event_venue').notNull(),
  city: text('city').notNull(),
  eventDate: text('event_date').notNull(),
  eventEndDate: text('event_end_date').notNull(),
  eventStartTime: text('event_start_time').notNull(),
  eventDurationHours: integer('event_duration_hours').notNull(),
  specialInstructions: text('special_instructions').default(''),
  basePrice: integer('base_price').notNull(),
  addonsTotal: integer('addons_total').notNull(),
  discountAmount: integer('discount_amount').notNull().default(0),
  taxAmount: integer('tax_amount').notNull(),
  totalAmount: integer('total_amount').notNull(),
  advanceAmount: integer('advance_amount').notNull(),
  paidAmount: integer('paid_amount').notNull().default(0),
  remainingBalance: integer('remaining_balance').notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'),
  bookingStatus: text('booking_status').notNull().default('pending_payment'),
  assignedPhotographer: text('assigned_photographer').default('Unassigned'),
  assignedVideographer: text('assigned_videographer').default('Unassigned'),
  internalNotes: text('internal_notes').default(''),
  rescheduleRequestedDate: text('reschedule_requested_date').default(''),
  cancellationReason: text('cancellation_reason').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id')
    .references(() => bookings.id)
    .notNull(),
  bookingCode: text('booking_code').notNull(),
  razorpayOrderId: text('razorpay_order_id').notNull(),
  razorpayPaymentId: text('razorpay_payment_id').notNull(),
  razorpaySignature: text('razorpay_signature').notNull(),
  paymentMethod: text('payment_method').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('verified'),
  receiptNumber: text('receipt_number').notNull(),
  verifiedAt: timestamp('verified_at').defaultNow(),
});

export const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  mediaType: text('media_type').notNull().default('image'),
  imageUrl: text('image_url').notNull(),
  videoUrl: text('video_url').default(''),
  aspectRatio: text('aspect_ratio').notNull().default('16:9'),
  exifMeta: text('exif_meta').notNull(),
  featured: boolean('featured').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  clientName: text('client_name').notNull(),
  clientRole: text('client_role').notNull(),
  eventLocation: text('event_location').notNull(),
  quote: text('quote').notNull(),
  outcomeStat: text('outcome_stat').notNull(),
  rating: integer('rating').notNull().default(5),
  featured: boolean('featured').notNull().default(true),
});

export const bookingsRelations = relations(bookings, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));
