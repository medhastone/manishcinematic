import { eq, desc, asc } from 'drizzle-orm';
import { db } from './index.ts';
import {
  users,
  services,
  packages,
  addons,
  availabilitySlots,
  bookings,
  payments,
  portfolioItems,
  testimonials,
} from './schema.ts';

const IMG_HERO = '/assets/aistudio/2026-11-19_13.45.19_6f2fb6c3.jpg';
const IMG_BRIDE = '/assets/aistudio/2026-11-19_13.45.16_856a87fb.jpg';
const IMG_PREWEDDING = '/assets/aistudio/2026-11-19_13.44.35_328cbbb2.jpg';
const IMG_FASHION = '/assets/aistudio/2026-11-19_13.44.44_328bb63e.jpg';
const IMG_CINEMA = '/assets/aistudio/2026-11-19_13.45.04_428ef2b2.jpg';
const IMG_AERIAL = '/assets/aistudio/2026-11-19_13.45.08_508e406a.jpg';
const IMG_CAM_STUDIO_SPLIT = '/assets/aistudio/2026-11-19_13.45.19_6f2fb6c3.jpg';
const IMG_CAM_BRICK_RIM = '/assets/aistudio/2026-11-19_13.44.44_328bb63e.jpg';
const IMG_CAM_DENIM_BOKEH = '/assets/aistudio/2026-11-19_13.45.00_681ea09c.jpg';
const IMG_CAM_NOIR_PROFILE = '/assets/aistudio/2026-11-19_13.44.49_afb377d5.jpg';
const IMG_CAM_SKYLINE_STREET = '/assets/aistudio/2026-11-19_13.45.08_508e406a.jpg';
const IMG_CAM_OUTDOOR_HEADSHOT = '/assets/aistudio/2026-11-19_13.45.12_7b56caa0.jpg';

let isSeededCache = false;

export async function getOrCreateUser(uid: string, email: string, name?: string, phone?: string) {
  try {
    const adminEmails = ['ckchandan9801@gmail.com', 'admin@lumiereatelier.in'];
    const defaultRole = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'customer';

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        phone: phone || '',
        role: defaultRole,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user profile. Please try again later.', { cause: error });
  }
}

export async function updateUserProfile(uid: string, data: { name?: string; phone?: string; role?: string }) {
  try {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in updateUserProfile:', error);
    throw new Error('Failed to update user profile.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllUsers:', error);
    throw new Error('Failed to retrieve customer records.', { cause: error });
  }
}

export async function ensureSeeded() {
  if (isSeededCache) return;
  try {
    const existingServices = await db.select().from(services);
    if (existingServices.length > 0) {
      isSeededCache = true;
      return;
    }

    // 1. Seed all 11 photography & videography services
    const initialServices = [
      {
        slug: 'wedding-photography',
        name: 'Wedding Photography',
        category: 'Weddings',
        shortDescription: 'Multi-day editorial documentation of royal & intimate weddings with medium-format depth.',
        startingPrice: 85000,
        imageUrl: IMG_BRIDE,
        active: true,
      },
      {
        slug: 'pre-wedding',
        name: 'Pre-Wedding Shoot',
        category: 'Couples',
        shortDescription: 'Cinematic architectural and destination couple commissions before the celebration.',
        startingPrice: 35000,
        imageUrl: IMG_PREWEDDING,
        active: true,
      },
      {
        slug: 'wedding-cinematography',
        name: 'Wedding Cinematography',
        category: 'Cinema',
        shortDescription: 'Anamorphic 4K cinema films, bespoke sound design, and director-cut feature films.',
        startingPrice: 95000,
        imageUrl: IMG_CINEMA,
        active: true,
      },
      {
        slug: 'engagement',
        name: 'Engagement Photography',
        category: 'Weddings',
        shortDescription: 'Refined ring-ceremony and cocktail evening portraiture with rapid editorial turnaround.',
        startingPrice: 45000,
        imageUrl: IMG_CAM_STUDIO_SPLIT,
        active: true,
      },
      {
        slug: 'fashion-portfolio',
        name: 'Fashion & Portfolio Shoots',
        category: 'Editorial',
        shortDescription: 'Vogue-grade studio & location lookbooks for designers, models, and bridal couture houses.',
        startingPrice: 40000,
        imageUrl: IMG_CAM_BRICK_RIM,
        active: true,
      },
      {
        slug: 'drone-videography',
        name: 'Drone Videography',
        category: 'Aerial',
        shortDescription: 'Licensed dual-operator cinema drone aerials for heritage palaces and coastal resorts.',
        startingPrice: 25000,
        imageUrl: IMG_AERIAL,
        active: true,
      },
      {
        slug: 'maternity',
        name: 'Maternity Photography',
        category: 'Portraits',
        shortDescription: 'Timeless fine-art studio and natural-light maternal portraiture with styling assistance.',
        startingPrice: 28000,
        imageUrl: IMG_FASHION,
        active: true,
      },
      {
        slug: 'baby-shoot',
        name: 'Baby Photography',
        category: 'Portraits',
        shortDescription: 'Gentle, organic natural-light sessions crafted for newborns, milestones, and families.',
        startingPrice: 24000,
        imageUrl: IMG_CAM_OUTDOOR_HEADSHOT,
        active: true,
      },
      {
        slug: 'birthday',
        name: 'Birthday Photography',
        category: 'Celebrations',
        shortDescription: 'Milestone celebrations, private soirées, and luxury evening gatherings captured candidly.',
        startingPrice: 30000,
        imageUrl: IMG_CAM_DENIM_BOKEH,
        active: true,
      },
      {
        slug: 'corporate-events',
        name: 'Corporate Photography',
        category: 'Commercial',
        shortDescription: 'Executive summits, luxury brand launches, architectural profiles, and keynote coverage.',
        startingPrice: 50000,
        imageUrl: IMG_CAM_NOIR_PROFILE,
        active: true,
      },
      {
        slug: 'event-photography',
        name: 'Event Photography',
        category: 'Celebrations',
        shortDescription: 'Bespoke coverage for galas, private concerts, cultural festivals, and family estates.',
        startingPrice: 38000,
        imageUrl: IMG_CAM_SKYLINE_STREET,
        active: true,
      },
    ];

    for (const svc of initialServices) {
      await db.insert(services).values(svc).onConflictDoNothing();
    }

    // 2. Seed Packages
    const initialPackages = [
      {
        serviceSlug: 'wedding-photography',
        name: 'The Essential Monograph',
        tier: 'Essential',
        price: 85000,
        durationHours: 8,
        photographersCount: 2,
        cinematographersCount: 1,
        editedPhotosCount: 350,
        videoDeliverables: '4-Minute Cinematic Highlight Reel (4K)',
        albumIncluded: false,
        droneIncluded: false,
        benefits: JSON.stringify([
          'Private Cloud Gallery with 10-Year Archive',
          'Leica & Medium Format Primary Coverage',
          '25 Sneak-Peek Frames within 48 Hours',
        ]),
        advanceType: 'percentage',
        advanceValue: 30,
        seasonalDiscountPercent: 5,
        imageUrl: IMG_HERO,
        active: true,
      },
      {
        serviceSlug: 'wedding-photography',
        name: 'The Signature Atelier Edition',
        tier: 'Signature',
        price: 145000,
        durationHours: 16,
        photographersCount: 3,
        cinematographersCount: 2,
        editedPhotosCount: 650,
        videoDeliverables: '6-Min Cinematic Teaser + 25-Min Documentary Feature Film',
        albumIncluded: true,
        droneIncluded: true,
        benefits: JSON.stringify([
          'Handcrafted Italian Linen Coffee-Table Monograph (40 Spreads)',
          'Aerial Cinema Drone Coverage Included',
          'Dedicated On-Site Creative Director',
          '40 Preview Stills Delivered Next Morning',
        ]),
        advanceType: 'percentage',
        advanceValue: 30,
        seasonalDiscountPercent: 10,
        imageUrl: IMG_CINEMA,
        active: true,
      },
      {
        serviceSlug: 'wedding-photography',
        name: 'The Royal Heritage Commission',
        tier: 'Royal Editorial',
        price: 240000,
        durationHours: 24,
        photographersCount: 4,
        cinematographersCount: 3,
        editedPhotosCount: 1100,
        videoDeliverables: 'Anamorphic Cinema Trailer + 45-Min Feature + Full Ceremony Edit',
        albumIncluded: true,
        droneIncluded: true,
        benefits: JSON.stringify([
          '2 Luxury Archival Heirloom Albums + Parent Editions',
          'Complimentary Pre-Wedding Editorial Session',
          'Same-Day Edit Screening at Reception',
          'Dual-Operator FPV & Cinema Drone Team',
        ]),
        advanceType: 'percentage',
        advanceValue: 30,
        seasonalDiscountPercent: 10,
        imageUrl: IMG_AERIAL,
        active: true,
      },
      {
        serviceSlug: 'pre-wedding',
        name: 'Twilight Courtyard Session',
        tier: 'Essential',
        price: 35000,
        durationHours: 4,
        photographersCount: 1,
        cinematographersCount: 1,
        editedPhotosCount: 80,
        videoDeliverables: '90-Second Editorial Save-The-Date Reel',
        albumIncluded: false,
        droneIncluded: false,
        benefits: JSON.stringify([
          '2 Styling & Wardrobe Changes',
          'Location Scouting & Permit Assistance',
          'Online Editorial Gallery',
        ]),
        advanceType: 'percentage',
        advanceValue: 30,
        seasonalDiscountPercent: 0,
        imageUrl: IMG_PREWEDDING,
        active: true,
      },
      {
        serviceSlug: 'pre-wedding',
        name: 'Destination Editorial Story',
        tier: 'Signature',
        price: 65000,
        durationHours: 8,
        photographersCount: 2,
        cinematographersCount: 1,
        editedPhotosCount: 180,
        videoDeliverables: '3-Minute Anamorphic Couple Film + Vertical Reels',
        albumIncluded: true,
        droneIncluded: true,
        benefits: JSON.stringify([
          'Full-Day Sunrise to Twilight Coverage',
          'Aerial Drone Sequences Included',
          '20-Spread Fine Art Guestbook Album',
        ]),
        advanceType: 'percentage',
        advanceValue: 30,
        seasonalDiscountPercent: 5,
        imageUrl: IMG_AERIAL,
        active: true,
      },
      {
        serviceSlug: 'wedding-cinematography',
        name: 'Anamorphic Cinema Suite',
        tier: 'Signature',
        price: 95000,
        durationHours: 12,
        photographersCount: 0,
        cinematographersCount: 3,
        editedPhotosCount: 50,
        videoDeliverables: '4K Cinema Trailer + 30-Min Documentary Film + Raw Audio Stems',
        albumIncluded: false,
        droneIncluded: true,
        benefits: JSON.stringify([
          'RED / Sony FX Cinema Line Production',
          'Custom Licensed Score & Live Vow Mastering',
          '50 High-Res Film Frame Grabs',
        ]),
        advanceType: 'percentage',
        advanceValue: 30,
        seasonalDiscountPercent: 5,
        imageUrl: IMG_CINEMA,
        active: true,
      },
      {
        serviceSlug: 'fashion-portfolio',
        name: 'Couture Lookbook Production',
        tier: 'Signature',
        price: 40000,
        durationHours: 6,
        photographersCount: 1,
        cinematographersCount: 1,
        editedPhotosCount: 60,
        videoDeliverables: '60-Second Behind-The-Scenes Campaign Motion Cut',
        albumIncluded: false,
        droneIncluded: false,
        benefits: JSON.stringify([
          'Studio Lighting & Tethered Monitor Review',
          'High-End Frequency Separation Retouching',
          'Commercial Print & Digital Usage License',
        ]),
        advanceType: 'percentage',
        advanceValue: 30,
        seasonalDiscountPercent: 0,
        imageUrl: IMG_FASHION,
        active: true,
      },
    ];

    for (const pkg of initialPackages) {
      await db.insert(packages).values(pkg);
    }

    // 3. Seed all 10 customizable add-ons
    const initialAddons = [
      {
        slug: 'additional-photographer',
        name: 'Additional Senior Photographer',
        description: 'Dedicated editorial candid or traditional angle coverage.',
        price: 15000,
        unit: 'per shift',
        active: true,
      },
      {
        slug: 'additional-cinematographer',
        name: 'Additional Cinema Operator',
        description: 'Second-angle gimbal and telephoto cinema camera operator.',
        price: 18000,
        unit: 'per shift',
        active: true,
      },
      {
        slug: 'drone-coverage',
        name: '4K Aerial Drone Coverage',
        description: 'Licensed pilot with Inspire/Mavic Pro cinema drone for venue aerials.',
        price: 12000,
        unit: 'per day',
        active: true,
      },
      {
        slug: 'cinematic-highlight-film',
        name: 'Cinematic Highlight Film (5–7 Min)',
        description: 'Color-graded director cut with bespoke sound design and vows.',
        price: 25000,
        unit: 'per film',
        active: true,
      },
      {
        slug: 'traditional-video',
        name: 'Full-Length Documentary Ritual Edit',
        description: 'Multi-camera chronological documentation of all ceremonies (60–90 min).',
        price: 20000,
        unit: 'per event',
        active: true,
      },
      {
        slug: 'premium-photo-album',
        name: 'Italian Linen Archival Monograph Album',
        description: '40 lay-flat museum-grade archival spreads in a bespoke linen clamshell box.',
        price: 22000,
        unit: 'per album',
        active: true,
      },
      {
        slug: 'pre-wedding-session',
        name: 'Pre-Wedding Portrait Session Add-On',
        description: 'Half-day architectural or sunset portrait session prior to wedding dates.',
        price: 28000,
        unit: 'per session',
        active: true,
      },
      {
        slug: 'extra-shooting-hours',
        name: 'Extended Production Coverage',
        description: 'Overtime coverage for late-night after-parties or early rituals.',
        price: 6000,
        unit: 'per hour',
        active: true,
      },
      {
        slug: 'express-delivery',
        name: '7-Day Express Editorial Turnaround',
        description: 'Priority dedicated colorist & editor queue for complete gallery in 7 days.',
        price: 18000,
        unit: 'priority queue',
        active: true,
      },
      {
        slug: 'additional-edited-photos',
        name: 'Additional 100 Fine-Art Retouched Frames',
        description: 'Expanded curation with signature film emulation and skin retouching.',
        price: 10000,
        unit: 'per 100 frames',
        active: true,
      },
    ];

    for (const addon of initialAddons) {
      await db.insert(addons).values(addon).onConflictDoNothing();
    }

    // 4. Seed Availability Slots for the current & upcoming months
    const initialSlots = [
      { eventDate: '2026-11-22', status: 'booked', totalTeams: 3, bookedTeams: 3, notes: 'Udaipur Palace Commission (All 3 Units Deployed)' },
      { eventDate: '2026-11-25', status: 'partially_booked', totalTeams: 3, bookedTeams: 2, notes: '1 Production Unit Remaining' },
      { eventDate: '2026-11-28', status: 'booked', totalTeams: 3, bookedTeams: 3, notes: 'Mumbai Taj Lands End Royal Wedding' },
      { eventDate: '2026-12-04', status: 'blocked', totalTeams: 3, bookedTeams: 3, notes: 'Annual Equipment Calibration & Lens Maintenance' },
      { eventDate: '2026-12-10', status: 'partially_booked', totalTeams: 3, bookedTeams: 1, notes: '2 Production Units Available' },
      { eventDate: '2026-12-14', status: 'booked', totalTeams: 3, bookedTeams: 3, notes: 'Jaipur Rambagh Destination Wedding' },
      { eventDate: '2026-12-19', status: 'available', totalTeams: 3, bookedTeams: 0, notes: 'Prime Muhurat Date - Open' },
    ];

    for (const slot of initialSlots) {
      await db.insert(availabilitySlots).values(slot).onConflictDoNothing();
    }

    // 5. Seed Portfolio Items
    const initialPortfolio = [
      {
        title: 'Aarav & Mira — The Suryagarh Sandstone Vows',
        category: 'Wedding',
        location: 'Jaisalmer, Rajasthan',
        mediaType: 'image',
        imageUrl: IMG_HERO,
        videoUrl: '',
        aspectRatio: '16:9',
        exifMeta: 'Leica SL2-S · APO-Summicron 35mm f/2 · ISO 160 · 1/1000s',
        featured: true,
      },
      {
        title: 'Nocturne by the kund — Dev & Tara',
        category: 'Pre-Wedding',
        location: 'Udaipur, Rajasthan',
        mediaType: 'image',
        imageUrl: IMG_PREWEDDING,
        videoUrl: '',
        aspectRatio: '4:3',
        exifMeta: 'Hasselblad X2D 100C · XCD 55mm f/2.5 · ISO 400 · 1/125s',
        featured: true,
      },
      {
        title: 'The Modern Mystic — Bridal Couture Monograph',
        category: 'Fashion',
        location: 'Mumbai & London',
        mediaType: 'image',
        imageUrl: IMG_FASHION,
        videoUrl: '',
        aspectRatio: '3:4',
        exifMeta: 'Hasselblad X2D 100C · XCD 90mm f/2.5 · ISO 64 · 1/500s',
        featured: true,
      },
      {
        title: 'Symphony in Anamorphic — Kabir & Elena Reception Film',
        category: 'Cinematography',
        location: 'New Delhi',
        mediaType: 'video',
        imageUrl: IMG_CINEMA,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-couple-dancing-at-their-wedding-reception-42209-large.mp4',
        aspectRatio: '16:9',
        exifMeta: 'RED V-Raptor 8K VV · Atlas Orion 40mm 2x Anamorphic · 24fps',
        featured: true,
      },
      {
        title: 'Lake Pichola Golden Hour — Aerial Palace Study',
        category: 'Drone',
        location: 'Lake Pichola, Udaipur',
        mediaType: 'image',
        imageUrl: IMG_AERIAL,
        videoUrl: '',
        aspectRatio: '4:3',
        exifMeta: 'DJI Inspire 3 · Zenmuse X9-8K Air · DL 24mm f/2.8 · ISO 100',
        featured: true,
      },
    ];

    for (const item of initialPortfolio) {
      await db.insert(portfolioItems).values(item);
    }

    // 6. Seed Realistic Bihar Client Reviews (Hinglish, Hindi & English)
    const initialTestimonials = [
      {
        clientName: 'Vivek Kumar & Ritu Kumari',
        clientRole: 'Wedding Photography',
        eventLocation: 'Teghra, Begusarai',
        quote:
          'Manish bhaiya aur unki poori team ka kaam ekdum next level hai. Haldi se leke bidai tak sab kuch itne ache se cover kiya ki teaser dekh ke ghar ke sabhi log emotional ho gaye. Begusarai me isse better cinema shoot nahi milega.',
        outcomeStat: '5★ Client Review',
        rating: 5,
        featured: true,
      },
      {
        clientName: 'Satyam Raj',
        clientRole: 'Pre-Wedding Shoot',
        eventLocation: 'Refinery Township, Barauni',
        quote:
          'हमारा प्री-वेडिंग शूट मनीष सिनेमैटिक के साथ बहुत ही शानदार रहा। ड्रोन शॉट्स और शाम की रोशनी में जो वीडियो बना है, बिल्कुल फिल्म जैसा लगता है। पूरी टीम बहुत ही मिलनसार और समय की पाबंद है।',
        outcomeStat: '5★ Client Review',
        rating: 5,
        featured: true,
      },
      {
        clientName: 'Priyanka & Abhishek Jha',
        clientRole: 'Cinematic Wedding Film',
        eventLocation: 'Har Har Mahadev Chowk, Begusarai',
        quote:
          "Booked Manish Cinematic for my sister's wedding and reception in Begusarai. Very polite team, no unnecessary attitude, and they delivered our 4K highlight video and album right on time. Totally worth every rupee.",
        outcomeStat: '5★ Client Review',
        rating: 5,
        featured: true,
      },
      {
        clientName: 'Roshan Kumar Yadav',
        clientRole: 'Studio Portrait Shoot',
        eventLocation: 'Bihat, Begusarai',
        quote:
          'Apne bhai ke engagement aur outdoor portrait shoot ke liye bulaya tha. Camera quality aur color grading sach me zabardast hai, photos bilkul natural aayi hain bina zyada over-edit kiye. Full paisa vasool!',
        outcomeStat: '5★ Client Review',
        rating: 5,
        featured: true,
      },
      {
        clientName: 'Kajal & Deepak Sharma',
        clientRole: 'Wedding Photography',
        eventLocation: 'Station Road, Samastipur',
        quote:
          'Wedding photos aur drone footage dono bohot pasand aaye sabko. Album printing ka quality bhi heavy aur premium tha. Bas final full video aane me 2-3 din thoda late hua tha wedding season ke wajah se, baki work 10/10 hai.',
        outcomeStat: '4★ Client Review',
        rating: 4,
        featured: true,
      },
      {
        clientName: 'Prashant Kumar Singh',
        clientRole: 'Cinematic Wedding Film',
        eventLocation: 'Mokama, Patna',
        quote:
          'मनीष जी का काम दिल जीत लेने वाला है। बारात का ड्रोन वीडियो और जयमाला का सिनेमैटिक शॉट देखकर सारे रिश्तेदार नंबर मांग रहे थे। बजट भी सही है और व्यवहार भी बहुत बढ़िया है।',
        outcomeStat: '5★ Client Review',
        rating: 5,
        featured: true,
      },
    ];

    for (const t of initialTestimonials) {
      await db.insert(testimonials).values(t);
    }

    // 7. Seed 2 Realistic Sample Bookings & Verified Payments so Admin Dashboard has initial analytics
    const sampleBooking1 = await db
      .insert(bookings)
      .values({
        bookingCode: 'LUM-2026-9041',
        userUid: 'sample-vip-client-1',
        customerName: 'Siddharth & Rhea Malhotra',
        customerEmail: 'siddharth.malhotra@example.com',
        customerPhone: '+91 98201 44510',
        serviceSlug: 'wedding-photography',
        serviceName: 'Wedding Photography',
        packageId: 2,
        packageName: 'The Signature Atelier Edition',
        selectedAddons: JSON.stringify([
          { slug: 'traditional-video', name: 'Full-Length Documentary Ritual Edit', price: 20000, quantity: 1 },
        ]),
        eventFunctions: JSON.stringify(['Sangeet & Cocktails', 'Haldi Courtyard', 'Royal Wedding', 'Grand Reception']),
        eventName: 'Siddharth & Rhea Royal Wedding',
        eventVenue: 'The Oberoi Udaivilas',
        city: 'Udaipur',
        eventDate: '2026-12-10',
        eventEndDate: '2026-12-12',
        eventStartTime: '10:00 AM',
        eventDurationHours: 16,
        specialInstructions: 'Focus on candid architectural portraits during golden hour.',
        basePrice: 145000,
        addonsTotal: 20000,
        discountAmount: 14500,
        taxAmount: 27090,
        totalAmount: 177590,
        advanceAmount: 53277,
        paidAmount: 53277,
        remainingBalance: 124313,
        paymentStatus: 'advance_paid',
        bookingStatus: 'confirmed',
        assignedPhotographer: 'Aryan Verma (Lead Medium Format)',
        assignedVideographer: 'Kabir Sen (RED Cinema Director)',
        internalNotes: 'VIP Palace Permit approved. Travel flights booked.',
      })
      .returning();

    if (sampleBooking1[0]) {
      await db.insert(payments).values({
        bookingId: sampleBooking1[0].id,
        bookingCode: sampleBooking1[0].bookingCode,
        razorpayOrderId: 'order_Lumiere9041Rzp',
        razorpayPaymentId: 'pay_Lumiere9041Verified',
        razorpaySignature: 'verified_hmac_sha256_seed_signature_9041',
        paymentMethod: 'UPI',
        amount: 53277,
        status: 'verified',
        receiptNumber: 'RCPT-LUM-2026-9041',
      });
    }

    const sampleBooking2 = await db
      .insert(bookings)
      .values({
        bookingCode: 'LUM-2026-9088',
        userUid: 'sample-vip-client-2',
        customerName: 'Nandini & Devansh Rao',
        customerEmail: 'nandini.rao@example.com',
        customerPhone: '+91 98112 77890',
        serviceSlug: 'pre-wedding',
        serviceName: 'Pre-Wedding Shoot',
        packageId: 5,
        packageName: 'Destination Editorial Story',
        selectedAddons: JSON.stringify([
          { slug: 'express-delivery', name: '7-Day Express Editorial Turnaround', price: 18000, quantity: 1 },
        ]),
        eventFunctions: JSON.stringify(['Sunrise Architectural Shoot', 'Twilight Lake Boat Editorial']),
        eventName: 'Nandini & Devansh Pre-Wedding Editorial',
        eventVenue: 'Alila Fort Bishangarh',
        city: 'Jaipur',
        eventDate: '2026-11-25',
        eventEndDate: '2026-11-25',
        eventStartTime: '06:30 AM',
        eventDurationHours: 8,
        specialInstructions: 'Include 9:16 vertical save-the-date cut.',
        basePrice: 65000,
        addonsTotal: 18000,
        discountAmount: 3250,
        taxAmount: 14355,
        totalAmount: 94105,
        advanceAmount: 28232,
        paidAmount: 28232,
        remainingBalance: 65873,
        paymentStatus: 'advance_paid',
        bookingStatus: 'approved',
        assignedPhotographer: 'Meera Nair (Editorial Director)',
        assignedVideographer: 'Rishi Hegde (Drone & Gimbal)',
        internalNotes: 'Wardrobe moodboard finalized with stylist.',
      })
      .returning();

    if (sampleBooking2[0]) {
      await db.insert(payments).values({
        bookingId: sampleBooking2[0].id,
        bookingCode: sampleBooking2[0].bookingCode,
        razorpayOrderId: 'order_Lumiere9088Rzp',
        razorpayPaymentId: 'pay_Lumiere9088Verified',
        razorpaySignature: 'verified_hmac_sha256_seed_signature_9088',
        paymentMethod: 'Card',
        amount: 28232,
        status: 'verified',
        receiptNumber: 'RCPT-LUM-2026-9088',
      });
    }

    isSeededCache = true;
  } catch (error) {
    console.error('Database query failed in ensureSeeded:', error);
    throw new Error('Failed to initialize studio catalog data.', { cause: error });
  }
}

export async function getCatalogData() {
  try {
    await ensureSeeded();
    const [allServices, allPackages, allAddons, allSlots, allPortfolio, allTestimonials] = await Promise.all([
      db.select().from(services).orderBy(asc(services.id)),
      db.select().from(packages).orderBy(asc(packages.price)),
      db.select().from(addons).orderBy(asc(addons.id)),
      db.select().from(availabilitySlots).orderBy(asc(availabilitySlots.eventDate)),
      db.select().from(portfolioItems).orderBy(asc(portfolioItems.id)),
      db.select().from(testimonials).orderBy(desc(testimonials.id)),
    ]);

    return {
      services: allServices,
      packages: allPackages,
      addons: allAddons,
      availabilitySlots: allSlots,
      portfolioItems: allPortfolio,
      testimonials: allTestimonials,
    };
  } catch (error) {
    console.error('Database query failed in getCatalogData:', error);
    throw new Error('Failed to load studio catalog data.', { cause: error });
  }
}

export async function checkDateAvailability(eventDate: string) {
  try {
    const existing = await db
      .select()
      .from(availabilitySlots)
      .where(eq(availabilitySlots.eventDate, eventDate));

    if (existing.length === 0) {
      return { available: true, remainingTeams: 3, status: 'available' };
    }

    const slot = existing[0];
    if (slot.status === 'blocked' || slot.status === 'booked' || slot.bookedTeams >= slot.totalTeams) {
      return {
        available: false,
        remainingTeams: 0,
        status: slot.status,
        notes: slot.notes || 'All production units are booked or blocked on this date.',
      };
    }

    return {
      available: true,
      remainingTeams: slot.totalTeams - slot.bookedTeams,
      status: slot.status,
      notes: slot.notes,
    };
  } catch (error) {
    console.error('Database query failed in checkDateAvailability:', error);
    throw new Error('Failed to validate event date availability.', { cause: error });
  }
}

export async function createPendingBooking(input: {
  userUid: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceSlug: string;
  packageId: number;
  selectedAddonSlugs: { slug: string; quantity: number }[];
  eventFunctions: string[];
  eventName: string;
  eventVenue: string;
  city: string;
  eventDate: string;
  eventEndDate: string;
  eventStartTime: string;
  eventDurationHours: number;
  specialInstructions: string;
}) {
  try {
    // 1. Validate availability on the server
    const availability = await checkDateAvailability(input.eventDate);
    if (!availability.available) {
      throw new Error(`Selected date (${input.eventDate}) is unavailable: ${availability.notes}`);
    }

    // 2. Fetch authoritative package price & advance rules from DB
    const pkgRows = await db.select().from(packages).where(eq(packages.id, input.packageId));
    if (pkgRows.length === 0) {
      throw new Error('Selected package was not found.');
    }
    const pkg = pkgRows[0];

    const svcRows = await db.select().from(services).where(eq(services.slug, input.serviceSlug));
    const serviceName = svcRows[0]?.name || input.serviceSlug;

    // 3. Fetch authoritative add-on prices from DB
    const allAddons = await db.select().from(addons);
    const addonMap = new Map(allAddons.map((a) => [a.slug, a]));

    let addonsTotal = 0;
    const verifiedAddons: { slug: string; name: string; price: number; quantity: number }[] = [];

    for (const item of input.selectedAddonSlugs) {
      const dbAddon = addonMap.get(item.slug);
      if (dbAddon && item.quantity > 0) {
        const lineTotal = dbAddon.price * item.quantity;
        addonsTotal += lineTotal;
        verifiedAddons.push({
          slug: dbAddon.slug,
          name: dbAddon.name,
          price: dbAddon.price,
          quantity: item.quantity,
        });
      }
    }

    const basePrice = pkg.price;
    const discountAmount =
      pkg.seasonalDiscountPercent > 0 ? Math.round((basePrice * pkg.seasonalDiscountPercent) / 100) : 0;
    const taxableAmount = Math.max(0, basePrice - discountAmount + addonsTotal);
    const taxAmount = Math.round(taxableAmount * 0.18); // 18% GST
    const totalAmount = taxableAmount + taxAmount;

    const advanceAmount =
      pkg.advanceType === 'fixed'
        ? Math.min(pkg.advanceValue, totalAmount)
        : Math.round((totalAmount * pkg.advanceValue) / 100);

    const remainingBalance = totalAmount - advanceAmount;
    const bookingCode = `LUM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const inserted = await db
      .insert(bookings)
      .values({
        bookingCode,
        userUid: input.userUid,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        serviceSlug: input.serviceSlug,
        serviceName,
        packageId: pkg.id,
        packageName: pkg.name,
        selectedAddons: JSON.stringify(verifiedAddons),
        eventFunctions: JSON.stringify(input.eventFunctions),
        eventName: input.eventName,
        eventVenue: input.eventVenue,
        city: input.city,
        eventDate: input.eventDate,
        eventEndDate: input.eventEndDate || input.eventDate,
        eventStartTime: input.eventStartTime,
        eventDurationHours: input.eventDurationHours || pkg.durationHours,
        specialInstructions: input.specialInstructions || '',
        basePrice,
        addonsTotal,
        discountAmount,
        taxAmount,
        totalAmount,
        advanceAmount,
        paidAmount: 0,
        remainingBalance: totalAmount,
        paymentStatus: 'pending',
        bookingStatus: 'pending_payment',
      })
      .returning();

    return inserted[0];
  } catch (error: any) {
    console.error('Database query failed in createPendingBooking:', error);
    throw new Error(error.message || 'Failed to create booking record.', { cause: error });
  }
}

export async function confirmVerifiedPayment(input: {
  bookingId: number;
  bookingCode: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod: string;
}) {
  try {
    const existingRows = await db.select().from(bookings).where(eq(bookings.id, input.bookingId));
    if (existingRows.length === 0) {
      throw new Error('Booking record not found for payment verification.');
    }
    const booking = existingRows[0];

    const paidNow = booking.advanceAmount;
    const newRemaining = Math.max(0, booking.totalAmount - paidNow);
    const receiptNumber = `RCPT-${booking.bookingCode}`;

    // 1. Insert verified payment record
    const paymentRows = await db
      .insert(payments)
      .values({
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        razorpayOrderId: input.razorpayOrderId,
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        paymentMethod: input.paymentMethod,
        amount: paidNow,
        status: 'verified',
        receiptNumber,
      })
      .returning();

    // 2. Update booking status to confirmed & advance_paid
    const updatedBookingRows = await db
      .update(bookings)
      .set({
        paidAmount: paidNow,
        remainingBalance: newRemaining,
        paymentStatus: newRemaining === 0 ? 'fully_paid' : 'advance_paid',
        bookingStatus: 'confirmed',
      })
      .where(eq(bookings.id, booking.id))
      .returning();

    // 3. Lock team availability slot on the eventDate
    const existingSlot = await db
      .select()
      .from(availabilitySlots)
      .where(eq(availabilitySlots.eventDate, booking.eventDate));

    if (existingSlot.length === 0) {
      await db.insert(availabilitySlots).values({
        eventDate: booking.eventDate,
        status: 'partially_booked',
        totalTeams: 3,
        bookedTeams: 1,
        notes: `Booked: ${booking.bookingCode} (${booking.city})`,
      });
    } else {
      const slot = existingSlot[0];
      const newBooked = Math.min(slot.totalTeams, slot.bookedTeams + 1);
      const newStatus = newBooked >= slot.totalTeams ? 'booked' : 'partially_booked';
      await db
        .update(availabilitySlots)
        .set({
          bookedTeams: newBooked,
          status: newStatus,
        })
        .where(eq(availabilitySlots.id, slot.id));
    }

    return {
      booking: updatedBookingRows[0],
      payment: paymentRows[0],
    };
  } catch (error) {
    console.error('Database query failed in confirmVerifiedPayment:', error);
    throw new Error('Failed to record verified payment in database.', { cause: error });
  }
}

export async function getCustomerBookings(userUid: string, email?: string) {
  try {
    await ensureSeeded();
    const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    const allPayments = await db.select().from(payments).orderBy(desc(payments.verifiedAt));

    const userBookings = allBookings.filter(
      (b) => b.userUid === userUid || (email && b.customerEmail.toLowerCase() === email.toLowerCase())
    );

    return {
      bookings: userBookings,
      payments: allPayments.filter((p) => userBookings.some((b) => b.id === p.bookingId)),
    };
  } catch (error) {
    console.error('Database query failed in getCustomerBookings:', error);
    throw new Error('Failed to retrieve customer bookings.', { cause: error });
  }
}

export async function requestBookingModification(input: {
  bookingId: number;
  action: 'reschedule' | 'cancel';
  rescheduleDate?: string;
  reason?: string;
}) {
  try {
    if (input.action === 'reschedule' && input.rescheduleDate) {
      const avail = await checkDateAvailability(input.rescheduleDate);
      if (!avail.available) {
        throw new Error(`Requested reschedule date ${input.rescheduleDate} is fully booked or unavailable.`);
      }
      const updated = await db
        .update(bookings)
        .set({
          bookingStatus: 'reschedule_requested',
          rescheduleRequestedDate: input.rescheduleDate,
        })
        .where(eq(bookings.id, input.bookingId))
        .returning();
      return updated[0];
    } else {
      const updated = await db
        .update(bookings)
        .set({
          bookingStatus: 'cancel_requested',
          cancellationReason: input.reason || 'Customer requested cancellation',
        })
        .where(eq(bookings.id, input.bookingId))
        .returning();
      return updated[0];
    }
  } catch (error: any) {
    console.error('Database query failed in requestBookingModification:', error);
    throw new Error(error.message || 'Failed to submit booking modification request.', { cause: error });
  }
}

export async function getAdminDashboardData() {
  try {
    await ensureSeeded();
    const [allBookings, allPayments, allPackages, allSlots, allPortfolio, allTestimonials, allUsers] =
      await Promise.all([
        db.select().from(bookings).orderBy(desc(bookings.createdAt)),
        db.select().from(payments).orderBy(desc(payments.verifiedAt)),
        db.select().from(packages).orderBy(asc(packages.id)),
        db.select().from(availabilitySlots).orderBy(asc(availabilitySlots.eventDate)),
        db.select().from(portfolioItems).orderBy(desc(portfolioItems.id)),
        db.select().from(testimonials).orderBy(desc(testimonials.id)),
        db.select().from(users).orderBy(desc(users.createdAt)),
      ]);

    return {
      bookings: allBookings,
      payments: allPayments,
      packages: allPackages,
      availabilitySlots: allSlots,
      portfolioItems: allPortfolio,
      testimonials: allTestimonials,
      users: allUsers,
    };
  } catch (error) {
    console.error('Database query failed in getAdminDashboardData:', error);
    throw new Error('Failed to load studio admin data.', { cause: error });
  }
}

export async function adminUpdateBooking(
  bookingId: number,
  updates: {
    bookingStatus?: string;
    paymentStatus?: string;
    assignedPhotographer?: string;
    assignedVideographer?: string;
    internalNotes?: string;
    paidAmount?: number;
    remainingBalance?: number;
    eventDate?: string;
  }
) {
  try {
    const result = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in adminUpdateBooking:', error);
    throw new Error('Failed to update booking record.', { cause: error });
  }
}

export async function adminUpsertPackage(input: {
  id?: number;
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
  advanceType: string;
  advanceValue: number;
  seasonalDiscountPercent: number;
  imageUrl: string;
  active: boolean;
}) {
  try {
    if (input.id) {
      const { id, ...rest } = input;
      const updated = await db.update(packages).set(rest).where(eq(packages.id, id)).returning();
      return updated[0];
    } else {
      const inserted = await db.insert(packages).values(input).returning();
      return inserted[0];
    }
  } catch (error) {
    console.error('Database query failed in adminUpsertPackage:', error);
    throw new Error('Failed to save package configuration.', { cause: error });
  }
}

export async function adminUpsertAvailability(input: {
  eventDate: string;
  status: string;
  totalTeams: number;
  bookedTeams: number;
  notes: string;
}) {
  try {
    const result = await db
      .insert(availabilitySlots)
      .values(input)
      .onConflictDoUpdate({
        target: availabilitySlots.eventDate,
        set: {
          status: input.status,
          totalTeams: input.totalTeams,
          bookedTeams: input.bookedTeams,
          notes: input.notes,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in adminUpsertAvailability:', error);
    throw new Error('Failed to update availability calendar slot.', { cause: error });
  }
}

export async function adminCreatePortfolioItem(input: {
  title: string;
  category: string;
  location: string;
  mediaType: string;
  imageUrl: string;
  videoUrl?: string;
  aspectRatio: string;
  exifMeta: string;
  featured: boolean;
}) {
  try {
    const inserted = await db
      .insert(portfolioItems)
      .values({
        ...input,
        videoUrl: input.videoUrl || '',
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in adminCreatePortfolioItem:', error);
    throw new Error('Failed to add portfolio item.', { cause: error });
  }
}

export async function adminDeletePortfolioItem(id: number) {
  try {
    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
    return { success: true };
  } catch (error) {
    console.error('Database query failed in adminDeletePortfolioItem:', error);
    throw new Error('Failed to delete portfolio item.', { cause: error });
  }
}

export async function adminCreateTestimonial(input: {
  clientName: string;
  clientRole: string;
  eventLocation: string;
  quote: string;
  outcomeStat: string;
  rating: number;
}) {
  try {
    const inserted = await db
      .insert(testimonials)
      .values({
        ...input,
        featured: true,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in adminCreateTestimonial:', error);
    throw new Error('Failed to add client testimonial.', { cause: error });
  }
}

export async function getPublicReviews() {
  try {
    await ensureSeeded();
    return await db.select().from(testimonials).orderBy(desc(testimonials.id));
  } catch (error) {
    console.error('Database query failed in getPublicReviews:', error);
    throw new Error('Failed to load client reviews.', { cause: error });
  }
}

export async function createPublicReview(input: {
  clientName: string;
  eventLocation: string;
  quote: string;
  rating: number;
  clientRole?: string;
}) {
  try {
    const safeRating = Math.min(5, Math.max(1, Math.round(input.rating)));
    const inserted = await db
      .insert(testimonials)
      .values({
        clientName: input.clientName.trim(),
        clientRole: (input.clientRole || 'Client Review').trim(),
        eventLocation: input.eventLocation.trim(),
        quote: input.quote.trim(),
        outcomeStat: `${safeRating}★ Client Review`,
        rating: safeRating,
        featured: true,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createPublicReview:', error);
    throw new Error('Failed to save client review.', { cause: error });
  }
}
