'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Film,
  Heart,
  IndianRupee,
  Infinity as InfinityIcon,
  MessageCircle,
  Phone,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Users,
  Video,
  VolumeX,
  X,
} from 'lucide-react';
import { ResilientImage } from '@/src/components/ResilientImage';

// ============================================================================
// EASY MANUAL CONFIGURATION — UPDATE THESE NUMBERS ANYTIME
// ============================================================================
const FESTIVE_OFFER_DAYS_LEFT = 5;
const WEDDING_DATES_LEFT_THIS_MONTH = 6;
const STUDIO_WHATSAPP_NUMBER = '918210057153';
const STUDIO_TEL_HREF = 'tel:+918210057153';
const SHOWREEL_EMBED_URL =
  'https://www.youtube.com/embed/BM6FN6dRmf0?autoplay=1&rel=0&modestbranding=1';

type CategoryTabId = 'wedding' | 'reels' | 'pre-wedding' | 'business' | 'addons';

interface PricingCardItem {
  id: string;
  name: string;
  subtitle: string;
  originalPrice: number;
  offerPrice: number;
  emiNote: string;
  popular?: boolean;
  previewImage: string;
  previewLabel: string;
  previewDuration: string;
  features: string[];
}

interface ExtraReelItem {
  id: string;
  name: string;
  originalPrice: number;
  offerPrice: number;
  note: string;
  deliverable: string;
}

interface AddonItem {
  id: string;
  name: string;
  price: number;
  unitLabel: string;
  detail: string;
}

interface ComboOfferItem {
  id: string;
  title: string;
  discountBadge: string;
  description: string;
  whatsappLabel: string;
}

interface HindiTestimonialItem {
  id: string;
  clientName: string;
  town: string;
  eventType: string;
  hindiQuote: string;
  thumbnail: string;
  duration: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const CATEGORY_TABS: { id: CategoryTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'wedding', label: 'Wedding', icon: Heart },
  { id: 'reels', label: 'Reels', icon: Film },
  { id: 'pre-wedding', label: 'Pre-Wedding', icon: Sparkles },
  { id: 'business', label: 'Business & Coaching', icon: Building2 },
  { id: 'addons', label: 'Add-ons', icon: Plus },
];

const PACKAGES_BY_TAB: Record<Exclude<CategoryTabId, 'addons'>, PricingCardItem[]> = {
  wedding: [
    {
      id: 'wedding-shubh',
      name: 'Shubh',
      subtitle: '1-Day Complete Shaadi Coverage',
      originalPrice: 29999,
      offerPrice: 24999,
      emiNote: 'Just ₹833/day for 30 days · Pay only 30% to book',
      previewImage: '/assets/aistudio/2026-11-19_13.45.19_6f2fb6c3.jpg',
      previewLabel: 'Shubh Highlight Reel',
      previewDuration: '0:45',
      features: [
        '1 day: baraat, dwar puja, jaimala, pheras, sindoor daan, vidaai',
        '1 photographer + 1 videographer',
        '250 edited photos, 8-min highlight film, 1 reel',
        'Digital delivery in 20 days',
      ],
    },
    {
      id: 'wedding-mangal',
      name: 'Mangal',
      subtitle: '2-Day Tilak/Haldi + Royal Wedding',
      originalPrice: 69999,
      offerPrice: 54999,
      emiNote: 'Just ₹1,833/day for 30 days · Pay only 30% to book',
      popular: true,
      previewImage: '/assets/aistudio/2026-11-19_13.45.16_856a87fb.jpg',
      previewLabel: 'Mangal Cinema Teaser',
      previewDuration: '1:20',
      features: [
        '2 days: tilak/haldi + wedding day',
        '2 photographers + 1 videographer',
        '500 edited photos, 3-min teaser + 15-min cinematic film, 3 reels',
        '20-page album, delivery in 25 days',
      ],
    },
    {
      id: 'wedding-rajwada',
      name: 'Rajwada',
      subtitle: '3-Day Grand Destination & Drone Film',
      originalPrice: 139999,
      offerPrice: 109999,
      emiNote: 'Just ₹3,667/day for 30 days · Pay only 30% to book',
      previewImage: '/assets/aistudio/2026-11-19_13.44.44_328bb63e.jpg',
      previewLabel: 'Rajwada 4K Drone Film',
      previewDuration: '2:15',
      features: [
        '3 days: tilak, haldi, sangeet, wedding, reception',
        '2 photographers + 2 videographers + drone',
        '800+ photos, 3-min teaser + 25-min film, 5 reels',
        '40-page premium album with box, 4K, delivery in 30 days',
      ],
    },
  ],
  reels: [
    {
      id: 'reel-dukaan',
      name: 'Dukaan Reel Pack',
      subtitle: 'For Shops, Salons & Restaurants',
      originalPrice: 4500,
      offerPrice: 2999,
      emiNote: 'Just ₹100/day for 30 days · Pay only 30% to book',
      previewImage: '/assets/aistudio/2026-11-19_14.43.52_c4eb0004.jpg',
      previewLabel: 'Dukaan Promo Reel',
      previewDuration: '0:30',
      features: [
        '3 reels for shops, salons, jewellery & restaurants',
        'High-retention hooks tailored for local Bihar buyers',
        '4K gimbal shoot + color grading + trending audio',
        'Fast delivery in 3–4 days',
      ],
    },
    {
      id: 'reel-shaadi',
      name: 'Shaadi Reel Pack',
      subtitle: 'Express Viral Wedding Reels',
      originalPrice: 5999,
      offerPrice: 3999,
      emiNote: 'Just ₹133/day for 30 days · Pay only 30% to book',
      popular: true,
      previewImage: '/assets/aistudio/2026-11-19_13.45.00_681ea09c.jpg',
      previewLabel: 'Shaadi Express Reel',
      previewDuration: '0:35',
      features: [
        '2–3 cinematic wedding reels (entry, jaimala, couple moments)',
        'Super-fast delivery in 24–48 hrs',
        'Shot on stabilized 4K cinema gimbal',
        'Optimized for Instagram Reels & WhatsApp Status',
      ],
    },
    {
      id: 'reel-coaching',
      name: 'Coaching Pack',
      subtitle: 'Teacher Intro & Topper Result Reels',
      originalPrice: 5499,
      offerPrice: 3499,
      emiNote: 'Just ₹117/day for 30 days · Pay only 30% to book',
      previewImage: '/assets/aistudio/2026-11-19_14.43.55_0be1e108.jpg',
      previewLabel: 'Coaching Admission Reel',
      previewDuration: '0:40',
      features: [
        '3 intro, classroom & topper result reels',
        'Crisp wireless mic voice clarity + Hindi/English captions',
        'Admission batch & scholarship callout graphics',
        'Ready for Instagram, YouTube Shorts & Facebook',
      ],
    },
  ],
  'pre-wedding': [
    {
      id: 'prewedding-reel',
      name: 'Pre-Wedding Reel',
      subtitle: 'Quick Romantic Reel & Portraits',
      originalPrice: 8999,
      offerPrice: 5999,
      emiNote: 'Just ₹200/day for 30 days · Pay only 30% to book',
      previewImage: '/assets/aistudio/2026-11-19_13.44.35_328cbbb2.jpg',
      previewLabel: 'Couple Reel Preview',
      previewDuration: '0:55',
      features: [
        '1 cinematic couple reel (60–90 sec)',
        '20 professionally retouched couple photos',
        'Guided poses & outdoor golden-hour shoot',
        'Digital delivery in 10 days',
      ],
    },
    {
      id: 'prewedding-plus',
      name: 'Pre-Wedding Plus',
      subtitle: 'Complete Story + 2 Outfits',
      originalPrice: 14999,
      offerPrice: 11999,
      emiNote: 'Just ₹400/day for 30 days · Pay only 30% to book',
      popular: true,
      previewImage: '/assets/aistudio/2026-11-19_13.45.04_428ef2b2.jpg',
      previewLabel: 'Pre-Wedding Plus Film',
      previewDuration: '1:15',
      features: [
        '1 cinematic reel + 50 edited high-res photos',
        '2 outfit looks with creative pose direction',
        'Scenic heritage / riverside locations around Begusarai',
        'Online gallery delivery in 12 days',
      ],
    },
    {
      id: 'prewedding-royal',
      name: 'Pre-Wedding Royal',
      subtitle: 'Drone Cinema + 3 Outfits',
      originalPrice: 24999,
      offerPrice: 19999,
      emiNote: 'Just ₹667/day for 30 days · Pay only 30% to book',
      previewImage: '/assets/aistudio/2026-11-19_14.57.32_3f4f843c.jpg',
      previewLabel: 'Royal Drone Pre-Wedding',
      previewDuration: '1:45',
      features: [
        '2 cinematic reels + 80 edited photos + Save-the-Date clip',
        '4K aerial drone coverage + 3 outfit changes',
        'Full-day curated outdoor storytelling shoot',
        'Express delivery in 15 days',
      ],
    },
  ],
  business: [
    {
      id: 'biz-dukaan',
      name: 'Dukaan Reel Pack',
      subtitle: 'Local Shops, Salons & Cafes',
      originalPrice: 4500,
      offerPrice: 2999,
      emiNote: 'Just ₹100/day for 30 days · Pay only 30% to book',
      previewImage: '/assets/aistudio/2026-11-19_14.43.52_c4eb0004.jpg',
      previewLabel: 'Shop Growth Reel',
      previewDuration: '0:30',
      features: [
        '3 promotional reels for shops, salons & restaurants',
        'Product showcase & walk-in customer offer script',
        'Clean Hindi/Hinglish text overlays & logo outro',
        'Fast 3–4 day turnaround',
      ],
    },
    {
      id: 'biz-coaching',
      name: 'Coaching Pack',
      subtitle: 'Admissions, Faculty & Topper Reels',
      originalPrice: 5499,
      offerPrice: 3499,
      emiNote: 'Just ₹117/day for 30 days · Pay only 30% to book',
      popular: true,
      previewImage: '/assets/aistudio/2026-11-19_14.43.55_0be1e108.jpg',
      previewLabel: 'Coaching Topper Reel',
      previewDuration: '0:42',
      features: [
        '3 intro, classroom & topper result reels',
        'Clear mic recording + bold subtitle captions',
        'Built for Begusarai, Barauni & Bihar coaching centres',
        'Boosts local parent trust & batch enquiries',
      ],
    },
    {
      id: 'biz-monthly',
      name: 'Monthly Brand Growth',
      subtitle: 'Full Monthly Reels + Photos Retainer',
      originalPrice: 12999,
      offerPrice: 9999,
      emiNote: 'Just ₹333/day for 30 days · Pay only 30% to book',
      previewImage: '/assets/aistudio/2026-11-19_14.43.57_47644050.jpg',
      previewLabel: 'Brand Campaign Reel',
      previewDuration: '0:50',
      features: [
        '8 monthly 4K reels + 25 edited business/campus photos',
        'Includes 1 festival special greeting reel every month',
        'Script guidance + ad-ready Instagram & Facebook format',
        'Priority 48-hour edit delivery',
      ],
    },
  ],
};

const REEL_EXTRAS: ExtraReelItem[] = [
  {
    id: 'extra-chhath',
    name: 'Chhath / Festival Reel',
    originalPrice: 2999,
    offerPrice: 1999,
    note: 'Just ₹67/day for 30 days · Pay only 30% to book',
    deliverable: '1 soulful festival reel (Chhath Puja, Durga Puja, Holi, Diwali) with family portraits',
  },
  {
    id: 'extra-birthday',
    name: 'Birthday / Engagement Reel',
    originalPrice: 2499,
    offerPrice: 1499,
    note: 'Just ₹50/day for 30 days · Pay only 30% to book',
    deliverable: '1 energetic celebration reel with cake-cutting / ring-ceremony highlights in 48 hrs',
  },
];

const COMBO_OFFERS: ComboOfferItem[] = [
  {
    id: 'combo-wedding-prewedding',
    title: 'Wedding (any package) + Pre-Wedding Reel',
    discountBadge: 'Extra ₹3,000 OFF',
    description: 'Book any wedding package along with a Pre-Wedding Reel and unlock instant combo savings.',
    whatsappLabel: 'Wedding + Pre-Wedding Reel Combo (Extra ₹3,000 OFF)',
  },
  {
    id: 'combo-engagement-wedding',
    title: 'Engagement + Wedding Booked Together',
    discountBadge: 'Extra ₹5,000 OFF',
    description: 'Same cinema team covers both sagai and shaadi for consistent color grading and storytelling.',
    whatsappLabel: 'Engagement + Wedding Combo (Extra ₹5,000 OFF)',
  },
  {
    id: 'combo-refer',
    title: 'Refer a Friend or Relative',
    discountBadge: '₹500 OFF for Both',
    description: 'When your friend books any package, both families enjoy ₹500 straight off their bill.',
    whatsappLabel: 'Refer a Friend Offer (₹500 OFF for both)',
  },
];

const ADDON_ITEMS: AddonItem[] = [
  {
    id: 'addon-drone',
    name: '4K Aerial Drone',
    price: 6000,
    unitLabel: '₹6,000',
    detail: 'Grand baraat, pandal & venue aerial cinema shots',
  },
  {
    id: 'addon-extra-photo',
    name: 'Extra Photographer',
    price: 5000,
    unitLabel: '₹5,000/day',
    detail: 'Dedicated candid or family-guest coverage',
  },
  {
    id: 'addon-live',
    name: 'Live Streaming',
    price: 7000,
    unitLabel: '₹7,000',
    detail: 'Full HD YouTube live broadcast for relatives abroad',
  },
  {
    id: 'addon-sameday',
    name: 'Same-Day 1-Min Preview Reel',
    price: 3000,
    unitLabel: '₹3,000',
    detail: 'Edited on-site to share during reception or next morning',
  },
  {
    id: 'addon-parents-album',
    name: "Parents' Album",
    price: 4000,
    unitLabel: '₹4,000',
    detail: 'Additional curated matte-finish album for both families',
  },
  {
    id: 'addon-raw',
    name: 'Raw Footage',
    price: 5000,
    unitLabel: '₹5,000',
    detail: 'All original unedited video clips & RAW photos delivered',
  },
];

const RESULTS_COUNTERS = [
  { value: '100+', label: 'Events Covered', icon: Film },
  { value: '5 Lakh+', label: 'Reel Views', icon: Play },
  { value: '50+', label: 'Happy Families', icon: Users },
];

const HINDI_TESTIMONIALS: HindiTestimonialItem[] = [
  {
    id: 'test-1',
    clientName: 'रवि रंजन एवं पूजा कुमारी',
    town: 'Teghra, Begusarai',
    eventType: 'Mangal Wedding Package',
    hindiQuote:
      '“मनीष जी की टीम ने हमारी शादी की हर रस्म को फिल्म जैसा बना दिया। बारात से विदाई तक एक भी पल नहीं छूटा, और 25 दिन से पहले ही पूरा एल्बम व वीडियो मिल गया।”',
    thumbnail: '/assets/aistudio/2026-11-19_13.45.16_856a87fb.jpg',
    duration: '0:48',
  },
  {
    id: 'test-2',
    clientName: 'संतोष कुमार (Director, Sankalp Classes)',
    town: 'Barauni, Begusarai',
    eventType: 'Coaching Reel Pack',
    hindiQuote:
      '“हमारे कोचिंग के टॉपर और बैच एडमिशन रील्स पर 1.2 लाख से ज्यादा व्यूज आए। नए सेशन में सीधे व्हाट्सएप से एडमिशन इंक्वायरी दोगुनी हो गई!”',
    thumbnail: '/assets/aistudio/2026-11-19_14.43.55_0be1e108.jpg',
    duration: '0:36',
  },
  {
    id: 'test-3',
    clientName: 'अभिषेक एवं श्वेता सिंह',
    town: 'Samastipur, Bihar',
    eventType: 'Rajwada 3-Day Package',
    hindiQuote:
      '“ड्रोन शॉट्स और 4K सिनेमैटिक फिल्म देखकर घर के सभी बुजुर्ग भावुक हो गए। बजट में इतना प्रीमियम काम पूरे बिहार में मिलना मुश्किल है।”',
    thumbnail: '/assets/aistudio/2026-11-19_13.44.44_328bb63e.jpg',
    duration: '1:05',
  },
  {
    id: 'test-4',
    clientName: 'नीरज ठाकुर (Shubham Jewellers)',
    town: 'Begusarai Market',
    eventType: 'Dukaan Reel Pack',
    hindiQuote:
      '“सिर्फ ₹2,999 में 3 शानदार रील्स मिलीं। धनतेरस और लगन सीजन में ग्राहकों ने रील देखकर दुकान पर आकर खरीदारी की। पैसा वसूल सर्विस!”',
    thumbnail: '/assets/aistudio/2026-11-19_14.43.52_c4eb0004.jpg',
    duration: '0:32',
  },
];

const PAYMENT_STEPS = [
  {
    step: 'Step 01',
    percent: '30%',
    title: 'Book the Date',
    desc: 'Confirm your wedding or shoot date via UPI / Bank Transfer with an official digital receipt.',
  },
  {
    step: 'Step 02',
    percent: '40%',
    title: 'Before the Event',
    desc: 'Paid 2–3 days before the event or on Day 1 arrival so our crew & gear are 100% locked.',
  },
  {
    step: 'Step 03',
    percent: '30%',
    title: 'On Final Delivery',
    desc: 'Balance paid only after you review your edited wedding film, reels & printed album.',
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How to book?',
    answer:
      'Click "WhatsApp Par Book Karein" on any package or tap "Check Date Availability". Share your event date & venue — once confirmed, pay a small advance via UPI/Bank Transfer (starting at ₹2,000 to lock the date or 30% booking amount) and receive an instant booking confirmation.',
  },
  {
    question: 'What if the date changes?',
    answer:
      'We completely understand family schedule shifts! Inform us at least 10 days before your event and we will transfer 100% of your advance to the new date at zero extra charge (subject to date availability).',
  },
  {
    question: 'Do you travel to other districts?',
    answer:
      'Yes! We are based in Teghra, Begusarai and regularly shoot across Barauni, Bihat, Samastipur, Khagaria, Lakhisarai, Mokama, Patna, Darbhanga, Muzaffarpur, and all districts of Bihar & Jharkhand. Travel & stay outside home town are charged transparently at actuals.',
  },
  {
    question: 'How many edit rounds?',
    answer:
      'Every wedding film and reel package includes 2 complimentary revision rounds (music adjustments, clip swaps, or family member highlights) so your entire family loves the final cut.',
  },
  {
    question: 'How long for delivery?',
    answer:
      'Shaadi Reels are delivered in 24–48 hours! Shubh package takes 20 days, Mangal takes 25 days, and Rajwada 4K film + luxury album takes 30 days. Plus, we back it with our "Delivery on time or ₹1,000 OFF" promise.',
  },
  {
    question: 'Is the advance refundable?',
    answer:
      'Because we block our entire team & turn away other weddings on your booked date, the booking advance is non-refundable on cancellation. However, it is 100% adjustable toward a rescheduled date or another family function within 6 months.',
  },
];

function formatIndianRupee(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

interface PackagesPricingSectionProps {
  onCheckAvailability?: () => void;
}

export function PackagesPricingSection({ onCheckAvailability }: PackagesPricingSectionProps) {
  const [activeTab, setActiveTab] = useState<CategoryTabId>('wedding');
  const [preferredDate, setPreferredDate] = useState('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    subtitle: string;
  } | null>(null);

  // Live festive countdown timer (initialized cleanly from FESTIVE_OFFER_DAYS_LEFT)
  const [secondsRemaining, setSecondsRemaining] = useState(
    FESTIVE_OFFER_DAYS_LEFT * 86400 + 11 * 3600 + 42 * 60 + 18
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const days = Math.floor(secondsRemaining / 86400);
    const hours = Math.floor((secondsRemaining % 86400) / 3600);
    const mins = Math.floor((secondsRemaining % 3600) / 60);
    const secs = secondsRemaining % 60;
    return {
      days,
      hours: String(hours).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  }, [secondsRemaining]);

  const selectedAddons = useMemo(
    () => ADDON_ITEMS.filter((item) => selectedAddonIds.includes(item.id)),
    [selectedAddonIds]
  );

  const selectedAddonsTotal = useMemo(
    () => selectedAddons.reduce((sum, item) => sum + item.price, 0),
    [selectedAddons]
  );

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formattedDateLabel = useMemo(() => {
    if (!preferredDate) return 'my upcoming date';
    const parsed = new Date(`${preferredDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return preferredDate;
    return parsed.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [preferredDate]);

  const buildWhatsAppUrl = (packageName: string, includeSelectedAddons = true) => {
    const addonsSuffix =
      includeSelectedAddons && selectedAddons.length > 0
        ? ` along with Add-ons (${selectedAddons.map((a) => a.name).join(', ')})`
        : '';
    const text = `Hi, I am interested in the ${packageName} for ${formattedDateLabel}${addonsSuffix}.`;
    return `https://wa.me/${STUDIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleAvailabilityClick = () => {
    if (onCheckAvailability) {
      onCheckAvailability();
      return;
    }
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderAddonsGrid = (compactHeading = false) => (
    <div className={compactHeading ? 'space-y-6' : 'mt-16 pt-14 border-t border-[#D4AF37]/25 space-y-6'}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#F3D27A]">
            <Plus className="w-3.5 h-3.5" />
            Customize Your Package
          </span>
          <h3 className="font-pricing-heading font-bold text-2xl sm:text-3xl text-white mt-1">
            Popular Add-ons
          </h3>
          <p className="text-sm text-[#F4E6E9]/80 mt-1">
            Tap <strong className="text-white">+ Add</strong> on any extra service — it automatically attaches to your WhatsApp booking.
          </p>
        </div>

        {selectedAddons.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#D4AF37]/50 bg-[#2C0710] px-4 py-2.5">
            <div className="text-xs text-[#F4E6E9]">
              <span className="font-semibold text-[#F3D27A] tabular-nums">
                {selectedAddons.length} selected
              </span>{' '}
              · +{formatIndianRupee(selectedAddonsTotal)}
            </div>
            <a
              href={buildWhatsAppUrl('Custom Add-ons Package', true)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1fb858] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Book Add-ons
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADDON_ITEMS.map((addon) => {
          const isAdded = selectedAddonIds.includes(addon.id);
          return (
            <div
              key={addon.id}
              className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 flex items-center justify-between gap-3 border ${
                isAdded
                  ? 'bg-[#FFFDF5] border-[#D4AF37] shadow-lg ring-2 ring-[#D4AF37]/40'
                  : 'bg-white border-[#EAD9DD] hover:border-[#D4AF37] hover:-translate-y-0.5 shadow-sm'
              }`}
            >
              <div className="min-w-0">
                <h4 className="font-pricing-heading font-bold text-base text-[#2E0710] truncate">
                  {addon.name}
                </h4>
                <p className="text-xs text-[#6B4A52] mt-0.5 line-clamp-2">{addon.detail}</p>
                <p className="font-pricing-heading font-bold text-sm text-[#7A1026] mt-1.5 tabular-nums">
                  {addon.unitLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleAddon(addon.id)}
                aria-pressed={isAdded}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#5C0D1E] hover:bg-[#7A1228] text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const activeTestimonial = HINDI_TESTIMONIALS[testimonialIdx];

  return (
    <section
      id="packages"
      aria-labelledby="pricing-section-heading"
      className="font-pricing-body relative overflow-hidden border-b border-[#D4AF37]/30 bg-gradient-to-b from-[#3E0815] via-[#4E0B1B] to-[#2B060F] py-20 lg:py-24 text-white"
    >
      {/* Subtle Festive Gold Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[760px] h-[360px] rounded-full bg-[#D4AF37]/15 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* 1. URGENCY BAR + FESTIVE COUNTDOWN TIMER */}
        <div className="max-w-4xl mx-auto mb-10 rounded-2xl border border-[#D4AF37]/50 bg-[#29050E]/90 px-4 py-4 sm:px-6 sm:py-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-[#F3D27A] font-pricing-heading font-semibold text-sm">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Festive Offer ends in {FESTIVE_OFFER_DAYS_LEFT} days</span>
              </div>
              <span className="hidden sm:inline text-[#D4AF37]/40">|</span>
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#FFE9B0]">
                <Calendar className="w-3.5 h-3.5 text-[#F3D27A]" />
                <span>Only {WEDDING_DATES_LEFT_THIS_MONTH} wedding dates left this month</span>
              </div>
            </div>

            {/* Live Countdown Digits */}
            <div
              role="timer"
              aria-label="Festive offer countdown timer"
              className="flex items-center gap-1.5 sm:gap-2 tabular-nums"
            >
              {[
                { val: String(countdown.days).padStart(2, '0'), lbl: 'Days' },
                { val: countdown.hours, lbl: 'Hrs' },
                { val: countdown.mins, lbl: 'Min' },
                { val: countdown.secs, lbl: 'Sec' },
              ].map((unit) => (
                <div
                  key={unit.lbl}
                  className="min-w-[48px] rounded-lg border border-[#D4AF37]/40 bg-[#4A0A18] px-2 py-1 text-center"
                >
                  <div className="font-pricing-heading font-bold text-sm sm:text-base text-[#F8DF8C] leading-tight">
                    {unit.val}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">
                    {unit.lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. SECTION HEADLINE & PREFERRED EVENT DATE PICKER */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#F3D27A]">
            Manish Cinematic · ManishCinematic.in · Bihar&apos;s Trusted Cinema Team
          </p>
          <h2
            id="pricing-section-heading"
            className="font-pricing-heading font-bold text-3xl sm:text-5xl text-white tracking-tight leading-[1.15]"
          >
            Apne Sapnon Ki Shaadi,{' '}
            <span className="text-[#F3D27A]">Bajat Mein</span>
          </h2>
          <p className="text-sm sm:text-base text-[#F5E6EA]/90 max-w-2xl mx-auto leading-relaxed">
            Cinematic wedding films &amp; reels that your family will watch for years.
          </p>

          {/* Optional Event Date Selector so WhatsApp booking auto-fills [date] */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <label
              htmlFor="pricing-event-date"
              className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-white/10 px-3.5 py-2 text-xs sm:text-sm text-[#FFF4D6]"
            >
              <CalendarCheck className="w-4 h-4 text-[#F3D27A] shrink-0" />
              <span className="whitespace-nowrap">Event Date (Optional):</span>
              <input
                id="pricing-event-date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none [color-scheme:dark]"
              />
            </label>
          </div>
        </div>

        {/* 3. CATEGORY TABS (Wedding | Reels | Pre-Wedding | Business & Coaching | Add-ons) */}
        <div
          role="tablist"
          aria-label="Photography & Videography Package Categories"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-12"
        >
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-pricing-heading font-semibold inline-flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3D27A] to-[#D4AF37] text-[#2B060F] shadow-[0_8px_24px_rgba(212,175,55,0.35)]'
                    : 'bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 hover:border-[#D4AF37]/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. PRICING CARDS (3 SIDE-BY-SIDE ON DESKTOP, STACKED ON MOBILE) */}
        <AnimatePresence mode="wait">
          {activeTab === 'addons' ? (
            <motion.div
              key="tab-addons"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24 }}
            >
              {renderAddonsGrid(true)}
            </motion.div>
          ) : (
            <motion.div
              key={`tab-${activeTab}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch pt-2">
                {PACKAGES_BY_TAB[activeTab].map((pkg) => {
                  const savings = pkg.originalPrice - pkg.offerPrice;
                  const isPopular = Boolean(pkg.popular);

                  return (
                    <article
                      key={pkg.id}
                      className={`group relative rounded-3xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${
                        isPopular
                          ? 'lg:scale-[1.04] lg:-my-2 z-10 border-2 border-[#D4AF37] bg-gradient-to-b from-[#5E0E21] via-[#420917] to-[#26050D] text-white shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_32px_rgba(212,175,55,0.28)]'
                          : 'border border-[#EAD9DD] bg-white text-[#24070E] shadow-[0_14px_38px_rgba(0,0,0,0.28)]'
                      }`}
                    >
                      {/* Most Popular Gold Ribbon on Middle Anchor Card */}
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full bg-gradient-to-r from-[#C89B2B] via-[#F6DC87] to-[#C89B2B] px-4 py-1.5 text-xs font-pricing-heading font-bold text-[#2B060F] shadow-lg flex items-center gap-1.5 border border-[#FFF3C4]">
                          <Star className="w-3.5 h-3.5 fill-[#2B060F] text-[#2B060F]" />
                          <span>Most Popular</span>
                        </div>
                      )}

                      <div>
                        {/* Auto-Playing Muted Reel Preview Strip */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-[22px] bg-[#1C050A]">
                          <ResilientImage
                            src={pkg.previewImage}
                            alt={`${pkg.name} sample wedding & reel preview`}
                            className="reel-preview-motion w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />

                          {/* Top-Left Muted Reel Preview Tag */}
                          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/65 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white border border-white/15">
                            <VolumeX className="w-3 h-3 text-[#F3D27A]" />
                            <span>Muted Reel Preview</span>
                          </div>

                          {/* Bottom Overlay: Label + Play Full Sample */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white drop-shadow">
                              {pkg.previewLabel} · {pkg.previewDuration}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveVideoModal({
                                  title: `${pkg.name} — Sample Film & Reel`,
                                  subtitle: 'Manish Cinematic Official Showreel Preview',
                                })
                              }
                              aria-label={`Play ${pkg.name} sample video`}
                              className="inline-flex items-center gap-1 rounded-md bg-[#D4AF37] hover:bg-[#F3D27A] text-[#2B060F] px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Watch
                            </button>
                          </div>

                          {/* Animated Reel Progress Indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div className="reel-preview-bar h-full w-full bg-[#D4AF37]" />
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 sm:p-7">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3
                                className={`font-pricing-heading font-bold text-2xl ${
                                  isPopular ? 'text-[#F6DC87]' : 'text-[#4A0A18]'
                                }`}
                              >
                                {pkg.name}
                              </h3>
                              <p
                                className={`text-xs sm:text-sm mt-0.5 ${
                                  isPopular ? 'text-[#F3DCE1]' : 'text-[#6A4A52]'
                                }`}
                              >
                                {pkg.subtitle}
                              </p>
                            </div>
                            {/* Green You Save Badge */}
                            <span className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm tabular-nums">
                              You Save {formatIndianRupee(savings)}
                            </span>
                          </div>

                          {/* Price Psychology Block */}
                          <div
                            className={`mt-5 pb-5 border-b ${
                              isPopular ? 'border-[#D4AF37]/30' : 'border-[#EFE2E5]'
                            }`}
                          >
                            <div className="flex items-baseline gap-2.5 flex-wrap">
                              <span
                                className={`text-sm sm:text-base line-through tabular-nums ${
                                  isPopular ? 'text-white/55' : 'text-neutral-400'
                                }`}
                              >
                                {formatIndianRupee(pkg.originalPrice)}
                              </span>
                              <span
                                className={`font-pricing-heading font-extrabold text-3xl sm:text-4xl tracking-tight tabular-nums ${
                                  isPopular ? 'text-white' : 'text-[#3B0714]'
                                }`}
                              >
                                {formatIndianRupee(pkg.offerPrice)}
                              </span>
                            </div>
                            <p
                              className={`mt-1.5 text-xs font-medium ${
                                isPopular ? 'text-[#F8DF8C]' : 'text-[#7A1026]'
                              }`}
                            >
                              {pkg.emiNote}
                            </p>
                          </div>

                          {/* Deliverables Checklist */}
                          <ul className="mt-5 space-y-3">
                            {pkg.features.map((feature) => (
                              <li
                                key={feature}
                                className={`flex items-start gap-2.5 text-sm leading-snug ${
                                  isPopular ? 'text-[#FAF0F2]' : 'text-[#361A21]'
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                    isPopular
                                      ? 'bg-[#D4AF37]/25 text-[#F6DC87]'
                                      : 'bg-[#5C0D1E]/10 text-[#5C0D1E]'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Card CTAs */}
                      <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-1 space-y-2.5">
                        <a
                          href={buildWhatsAppUrl(`${pkg.name} (${formatIndianRupee(pkg.offerPrice)})`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-3.5 px-4 rounded-xl font-pricing-heading font-bold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-md ${
                            isPopular
                              ? 'bg-gradient-to-r from-[#D4AF37] via-[#F4D67B] to-[#D4AF37] hover:brightness-105 text-[#2B060F]'
                              : 'bg-[#5C0D1E] hover:bg-[#7A1228] text-white'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4 shrink-0" />
                          <span>WhatsApp Par Book Karein</span>
                        </a>

                        <a
                          href={STUDIO_TEL_HREF}
                          aria-label={`Call studio about ${pkg.name}`}
                          className={`w-full py-2.5 px-4 rounded-xl font-pricing-heading font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 border transition-colors ${
                            isPopular
                              ? 'border-[#D4AF37]/45 bg-white/10 hover:bg-white/15 text-white'
                              : 'border-[#D9C2C8] bg-[#FAF5F6] hover:bg-[#F3E7EA] text-[#4A0A18]'
                          }`}
                        >
                          <Phone className="w-4 h-4 shrink-0" />
                          <span>Call Now</span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Reels Tab Extras (Chhath/Festival Reel & Birthday/Engagement Reel) */}
              {activeTab === 'reels' && (
                <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#2A060F]/80 p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[#F3D27A]" />
                    <h3 className="font-pricing-heading font-bold text-lg text-white">
                      Special Festival &amp; Family Celebration Reels
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REEL_EXTRAS.map((extra) => (
                      <div
                        key={extra.id}
                        className="rounded-xl bg-white text-[#2B060F] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-pricing-heading font-bold text-base text-[#4A0A18]">
                              {extra.name}
                            </h4>
                            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">
                              You Save {formatIndianRupee(extra.originalPrice - extra.offerPrice)}
                            </span>
                          </div>
                          <p className="text-xs text-[#5E4148]">{extra.deliverable}</p>
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-xs text-neutral-400 line-through tabular-nums">
                              {formatIndianRupee(extra.originalPrice)}
                            </span>
                            <span className="font-pricing-heading font-extrabold text-xl text-[#3B0714] tabular-nums">
                              {formatIndianRupee(extra.offerPrice)}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-[#7A1026]">{extra.note}</p>
                        </div>

                        <div className="flex sm:flex-col gap-2 shrink-0">
                          <a
                            href={buildWhatsAppUrl(
                              `${extra.name} (${formatIndianRupee(extra.offerPrice)})`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-[#5C0D1E] hover:bg-[#7A1228] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp Par Book Karein
                          </a>
                          <a
                            href={STUDIO_TEL_HREF}
                            className="px-4 py-2 rounded-xl border border-[#D9C2C8] text-[#4A0A18] hover:bg-[#FAF3F5] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call Now
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. COMBO OFFERS (HIGHLIGHTED WITH GREEN "BEST VALUE" TAG) */}
        <div className="mt-14 pt-12 border-t border-[#D4AF37]/25">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#F3D27A]">
                <Tag className="w-3.5 h-3.5" />
                Extra Family Savings
              </span>
              <h3 className="font-pricing-heading font-bold text-2xl sm:text-3xl text-white mt-1">
                Combo Offers — Zyada Bachat
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#F4E6E9]/80">
              Combine functions &amp; unlock instant festive discounts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COMBO_OFFERS.map((combo) => (
              <div
                key={combo.id}
                className="relative rounded-2xl border border-[#D4AF37]/45 bg-gradient-to-br from-white to-[#FFF9EE] p-5 sm:p-6 text-[#2B060F] shadow-lg flex flex-col justify-between gap-4 hover:-translate-y-1 transition-transform"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      Best Value
                    </span>
                    <span className="font-pricing-heading font-extrabold text-sm text-[#7A1026] tabular-nums">
                      {combo.discountBadge}
                    </span>
                  </div>
                  <h4 className="font-pricing-heading font-bold text-lg text-[#3B0714] leading-snug">
                    {combo.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5E4148] leading-relaxed">
                    {combo.description}
                  </p>
                </div>

                <a
                  href={buildWhatsAppUrl(combo.whatsappLabel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#4A0A18] hover:bg-[#690F23] text-white text-xs sm:text-sm font-pricing-heading font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#F3D27A]" />
                  <span>Claim Combo on WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 6. RESULTS & TRUST SECTION (COUNTERS + HINDI VIDEO TESTIMONIALS + BADGES) */}
        <div className="mt-16 pt-14 border-t border-[#D4AF37]/25 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F3D27A]">
              Proven Results Across Bihar
            </span>
            <h3 className="font-pricing-heading font-bold text-2xl sm:text-4xl text-white mt-1">
              Parivaron Aur Businesses Ka Bharosa
            </h3>
          </div>

          {/* 3 Trust Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {RESULTS_COUNTERS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#D4AF37]/40 bg-[#2C0710]/85 p-6 text-center shadow-lg"
                >
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#F3D27A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-pricing-heading font-extrabold text-3xl sm:text-4xl text-[#F8DF8C] tabular-nums">
                    {stat.value}
                  </div>
                  <p className="text-sm font-medium text-white/90 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Guarantee & Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#D4AF37]/50 bg-white text-[#2B060F] px-5 py-4 flex items-center gap-4 shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-pricing-heading font-bold text-base text-[#3B0714]">
                  Delivery on time or ₹1,000 OFF
                </h4>
                <p className="text-xs sm:text-sm text-[#5E4148]">
                  Written delivery date promise on every booking receipt — zero excuses.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D4AF37]/50 bg-white text-[#2B060F] px-5 py-4 flex items-center gap-4 shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5C0D1E]/10 text-[#5C0D1E]">
                <InfinityIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-pricing-heading font-bold text-base text-[#3B0714]">
                  Unlimited gallery access
                </h4>
                <p className="text-xs sm:text-sm text-[#5E4148]">
                  Share private cloud photo &amp; film links with all relatives in India &amp; abroad.
                </p>
              </div>
            </div>
          </div>

          {/* Hindi Video Testimonials Slider */}
          <div className="rounded-3xl border border-[#D4AF37]/45 bg-[#24050C]/95 p-5 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F3D27A]">
                  Real Client Video Stories (Hindi)
                </p>
                <h4 className="font-pricing-heading font-bold text-xl sm:text-2xl text-white mt-0.5">
                  Suniye Hamare Clients Ki Zubani
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous client testimonial"
                  onClick={() =>
                    setTestimonialIdx(
                      (prev) => (prev - 1 + HINDI_TESTIMONIALS.length) % HINDI_TESTIMONIALS.length
                    )
                  }
                  className="h-10 w-10 rounded-xl border border-[#D4AF37]/40 bg-white/10 hover:bg-[#D4AF37] hover:text-[#2B060F] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next client testimonial"
                  onClick={() =>
                    setTestimonialIdx((prev) => (prev + 1) % HINDI_TESTIMONIALS.length)
                  }
                  className="h-10 w-10 rounded-xl border border-[#D4AF37]/40 bg-white/10 hover:bg-[#D4AF37] hover:text-[#2B060F] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Video Testimonial Preview Tile */}
                <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#D4AF37]/40 bg-black">
                  <ResilientImage
                    src={activeTestimonial.thumbnail}
                    alt={`${activeTestimonial.clientName} video testimonial`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <button
                    type="button"
                    onClick={() =>
                      setActiveVideoModal({
                        title: `${activeTestimonial.clientName} (${activeTestimonial.town})`,
                        subtitle: `${activeTestimonial.eventType} — Manish Cinematic Client Highlight`,
                      })
                    }
                    aria-label={`Play video testimonial from ${activeTestimonial.clientName}`}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span className="h-14 w-14 rounded-full bg-[#D4AF37] group-hover:scale-105 text-[#2B060F] flex items-center justify-center shadow-2xl transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </span>
                    <span className="rounded-md bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                      Watch Video Story · {activeTestimonial.duration}
                    </span>
                  </button>
                </div>

                {/* Hindi Quote & Client Details */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-1 text-[#F3D27A]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-[#F3D27A] text-[#F3D27A]" />
                    ))}
                    <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-white/75">
                      {activeTestimonial.eventType}
                    </span>
                  </div>
                  <blockquote className="text-base sm:text-xl font-medium text-white leading-relaxed">
                    {activeTestimonial.hindiQuote}
                  </blockquote>
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-pricing-heading font-bold text-base text-[#F8DF8C]">
                        {activeTestimonial.clientName}
                      </p>
                      <p className="text-xs sm:text-sm text-white/75">{activeTestimonial.town}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {HINDI_TESTIMONIALS.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-label={`View testimonial ${idx + 1}`}
                          onClick={() => setTestimonialIdx(idx)}
                          className="min-h-[36px] min-w-[28px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md"
                        >
                          <span
                            className={`h-2 rounded-full transition-all ${
                              idx === testimonialIdx
                                ? 'w-7 bg-[#D4AF37]'
                                : 'w-2 bg-white/40 hover:bg-white/75'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 7. ADD-ONS SECTION (SHOWN BELOW CARDS WHEN NOT ON ADD-ONS TAB) */}
        {activeTab !== 'addons' && renderAddonsGrid(false)}

        {/* 8. 3-STEP VISUAL PAYMENT PLAN */}
        <div className="mt-16 pt-14 border-t border-[#D4AF37]/25">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#F3D27A]">
              <IndianRupee className="w-3.5 h-3.5" />
              Easy &amp; Stress-Free Payments
            </span>
            <h3 className="font-pricing-heading font-bold text-2xl sm:text-3xl text-white mt-1">
              3-Step Simple Payment Plan
            </h3>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
            {PAYMENT_STEPS.map((item, idx) => (
              <div
                key={item.step}
                className="relative rounded-2xl bg-white text-[#2B060F] p-6 border border-[#EAD9DD] shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#7A1026]">
                    {item.step}
                  </span>
                  <span className="font-pricing-heading font-extrabold text-3xl text-[#4A0A18] tabular-nums">
                    {item.percent}
                  </span>
                </div>
                <h4 className="font-pricing-heading font-bold text-lg text-[#2B060F]">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#5E4148] mt-1.5 leading-relaxed">
                  {item.desc}
                </p>

                {idx < PAYMENT_STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-[#D4AF37] text-[#2B060F] items-center justify-center shadow"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-xs sm:text-sm font-medium text-[#FFE9B0]">
            No hidden charges. Travel outside the home town charged separately.
          </p>
        </div>

        {/* 9. FAQ ACCORDION */}
        <div className="mt-16 pt-14 border-t border-[#D4AF37]/25 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F3D27A]">
              Common Questions
            </span>
            <h3 className="font-pricing-heading font-bold text-2xl sm:text-3xl text-white mt-1">
              Booking Se Jude Sawal (FAQ)
            </h3>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-[#D4AF37]/30 bg-white text-[#2B060F] overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FAF4F5] transition-colors cursor-pointer"
                  >
                    <span className="font-pricing-heading font-bold text-sm sm:text-base text-[#3B0714]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[#7A1026] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-0 text-xs sm:text-sm text-[#573A41] leading-relaxed border-t border-[#F0E4E7]">
                          <p className="pt-3">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* 10. FINAL CTA BANNER */}
        <div className="mt-16 rounded-3xl border-2 border-[#D4AF37] bg-gradient-to-r from-[#29050E] via-[#560C1D] to-[#29050E] p-7 sm:p-10 text-center shadow-[0_24px_56px_rgba(0,0,0,0.5)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 px-3.5 py-1 text-xs font-semibold text-[#F8DF8C] mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>Limited Wedding Season Slots · Begusarai &amp; All Bihar</span>
          </div>
          <h3 className="font-pricing-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Date lock karein sirf <span className="text-[#F6DC87]">₹2,000 advance</span> mein
          </h3>
          <p className="text-sm sm:text-base text-[#F5E6EA]/85 max-w-2xl mx-auto mt-2.5">
            Instant availability check on WhatsApp · Official booking receipt · Zero hidden fees.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href={buildWhatsAppUrl('₹2,000 Date Lock Offer')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F4D67B] to-[#D4AF37] hover:brightness-105 text-[#2B060F] font-pricing-heading font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Par Book Karein</span>
            </a>

            <a
              href={STUDIO_TEL_HREF}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 text-white font-pricing-heading font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F3D27A]" />
              <span>Call Now</span>
            </a>

            <button
              type="button"
              onClick={handleAvailabilityClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#D4AF37]/50 bg-[#2B060F]/80 hover:bg-[#3D0916] text-[#F8DF8C] font-pricing-heading font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Check Date Availability</span>
            </button>
          </div>
        </div>
      </div>

      {/* REEL / TESTIMONIAL VIDEO PREVIEW MODAL */}
      {activeVideoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeVideoModal.title}
          className="fixed inset-0 z-[85] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-[#D4AF37]/45 bg-[#1B050B] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F3D27A] flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>{activeVideoModal.subtitle}</span>
                </p>
                <h4 className="font-pricing-heading font-bold text-base sm:text-lg text-white truncate">
                  {activeVideoModal.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                aria-label="Close video preview"
                className="p-2 rounded-lg bg-white/10 hover:bg-[#D4AF37] hover:text-[#2B060F] text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={SHOWREEL_EMBED_URL}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
