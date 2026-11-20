'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Menu,
  X,
  Play,
  Camera,
  Heart,
  Film,
  Aperture,
  Video,
  Clapperboard,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  ExternalLink,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import {
  StudioService,
  StudioPackage,
  StudioAddon,
  AvailabilitySlot,
  PortfolioItem,
  StudioTestimonial,
  StudioBooking,
  StudioPayment,
} from '@/src/types/studio';
import { ManishLogo } from '@/src/components/ManishLogo';
import { ResilientImage } from '@/src/components/ResilientImage';
import { CinematicFloatingLayer } from '@/src/components/CinematicFloatingLayer';
import { QuickBookingForm } from '@/src/components/QuickBookingForm';
import { BookingWizard } from '@/src/components/BookingWizard';
import { CustomerPortal } from '@/src/components/CustomerPortal';
import { ClientReviewsSection } from '@/src/components/ClientReviewsSection';
import { PackagesPricingSection } from '@/src/components/PackagesPricingSection';

// ============================================================================
// EDITABLE STUDIO CONFIGURATION (Manish Cinematic — Begusarai, Bihar)
// ============================================================================
const STUDIO_STATS = [
  { id: 'weddings', label: 'Weddings Shot', target: 70, suffix: '+' },
  { id: 'couples', label: 'Happy Couples', target: 65, suffix: '+' },
  { id: 'experience', label: 'Years of Experience', target: 2, suffix: '+' },
  { id: 'films', label: 'Short Films', target: 20, suffix: '+' },
];

const FEATURED_SHOWREEL_VIDEOS = [
  {
    id: 'BM6FN6dRmf0',
    badge: 'Showreel 01',
    title: 'Official Cinema Showreel',
    subtitle: 'Wedding Films, Drone Aerials & Short Films · Begusarai, Bihar',
    watchUrl: 'https://youtu.be/BM6FN6dRmf0?si=OLfhfSy70yNT-6JC',
    embedUrl: 'https://www.youtube.com/embed/BM6FN6dRmf0?autoplay=1&rel=0&modestbranding=1',
    thumbHd: 'https://i.ytimg.com/vi/BM6FN6dRmf0/maxresdefault.jpg',
    thumbHq: 'https://i.ytimg.com/vi/BM6FN6dRmf0/hqdefault.jpg',
  },
  {
    id: 'VlQy8cF7_wk',
    badge: 'Featured Film 02',
    title: 'Cinematic Wedding & Shoot Preview',
    subtitle: 'Directed, Shot & Color-Graded by Manish Cinematic · Bihar',
    watchUrl: 'https://youtu.be/VlQy8cF7_wk?si=bw4NAYLKpi5SLL2w',
    embedUrl: 'https://www.youtube.com/embed/VlQy8cF7_wk?autoplay=1&rel=0&modestbranding=1',
    thumbHd: 'https://i.ytimg.com/vi/VlQy8cF7_wk/maxresdefault.jpg',
    thumbHq: 'https://i.ytimg.com/vi/VlQy8cF7_wk/hqdefault.jpg',
  },
] as const;

const SOCIAL_LINKS = {
  youtube: 'https://youtube.com/@biharmanishcinematic?si=9g4A5srHKq-bBkTA',
  instagram: 'https://www.instagram.com/manish___cinematic?utm_source=qr&gwpx=bG9nemV3bGgyZGJm',
  facebook: 'https://www.facebook.com/share/1FnsmZuGuc/',
  googleMaps:
    'https://www.google.com/maps/place/manishcinematic+video+and+photo+photographer/@25.5035447,85.9252307,1419m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39f273aa7eaa3209:0x130f2bb553405f7!8m2!3d25.5035447!4d85.9278056!16s%2Fg%2F11zkvwx_91?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MTExNi4wIKXMDSoASAFQAw%3D%3D',
  gmail:
    'https://mail.google.com/mail/?view=cm&fs=1&to=manishcinematic821005@gmail.com&su=Shoot%20Booking%20Inquiry%20-%20Manish%20Cinematic',
};

const MANISH_SERVICES = [
  {
    title: 'Wedding Photography',
    slug: 'wedding-photography',
    icon: Camera,
    description:
      'Timeless candid & editorial wedding frames capturing every ritual, emotion, and royal bridal portrait with dramatic cinema lighting.',
  },
  {
    title: 'Pre-Wedding Shoot',
    slug: 'pre-wedding',
    icon: Heart,
    description:
      'Story-driven romantic couple shoots across heritage venues, riversides, and curated destinations with bespoke wardrobe direction.',
  },
  {
    title: 'Cinematic Wedding Films',
    slug: 'wedding-cinematography',
    icon: Film,
    description:
      '4K anamorphic wedding teasers, emotional trailers, and full-length cinema documentaries graded like feature films.',
  },
  {
    title: 'Traditional Photography',
    slug: 'wedding-photography',
    icon: Aperture,
    description:
      'Complete family portraits, Tilak, Haldi, Mehendi, Shaadi, and Reception coverage so every loved one is preserved forever.',
  },
  {
    title: 'Videography',
    slug: 'wedding-cinematography',
    icon: Video,
    description:
      'Multi-camera HD & 4K ceremony documentation, gimbal movements, drone aerials, and crystal-clear live audio mastering.',
  },
  {
    title: 'Short Films',
    slug: 'fashion-portfolio',
    icon: Clapperboard,
    description:
      'Original narrative short films, music videos, and creative visual storytelling directed by Manish Cinematic.',
  },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Enquiry',
    subtitle: 'First Conversation',
    desc: 'Reach out via WhatsApp, Call, Gmail, or our online booking form with your wedding dates, venue in Begusarai or beyond, and vision.',
  },
  {
    num: '02',
    title: 'Planning',
    subtitle: 'Creative Blueprint',
    desc: 'We craft your shot list, timeline for Haldi, Mehendi, Shaadi & Reception, lighting setup, and drone/cinema crew allocation.',
  },
  {
    num: '03',
    title: 'Shoot',
    subtitle: 'Lights, Camera, Emotion',
    desc: 'Our cinematography & photography crew captures every candid laugh, tear, and grand entrance using cinema cameras and aerial drones.',
  },
  {
    num: '04',
    title: 'Editing',
    subtitle: 'Color & Sound Craft',
    desc: 'Each frame is color-graded in our darkroom suite, paired with cinematic music, real vows audio, and fine-art skin retouching.',
  },
  {
    num: '05',
    title: 'Delivery',
    subtitle: 'Forever Keepsakes',
    desc: 'Fast highlight previews for social sharing, full 4K cinema films, high-resolution cloud gallery, and handcrafted luxury albums.',
  },
];

const HERO_EQUIPMENT_ITEMS = [
  {
    id: 3001,
    title: '4K Color Grading & Editing Suite',
    shortLabel: 'EDITING SUITE',
    tag: 'POST-PRODUCTION',
    category: 'Studio Gear',
    location: 'Manish Cinematic Studio, Begusarai',
    imageUrl: '/assets/aistudio/2026-11-19_14.43.52_c4eb0004.jpg',
    exifMeta: 'Triple-Display 4K Color Grading Desk · Studio Audio & Mirrorless Cinema Rig',
    aspect: 'landscape' as const,
  },
  {
    id: 3002,
    title: 'DJI Ronin 3-Axis Cinema Gimbal',
    shortLabel: 'DJI RONIN RIG',
    tag: 'STABILIZED 4K',
    category: 'Studio Gear',
    location: 'On-Location Field Unit · Begusarai',
    imageUrl: '/assets/aistudio/2026-11-19_14.43.55_0be1e108.jpg',
    exifMeta: 'DJI Ronin Motorized Gimbal · Mirrorless Cinema Camera · Golden Hour Motion',
    aspect: 'portrait' as const,
  },
  {
    id: 3003,
    title: 'DJI Mini 4K Aerial Cinema Drone',
    shortLabel: 'DJI MINI 4K',
    tag: 'AERIAL DRONE',
    category: 'Studio Gear',
    location: 'Aerial Production Unit · Bihar',
    imageUrl: '/assets/aistudio/2026-11-19_14.43.57_47644050.jpg',
    exifMeta: 'DJI Mini 4K Stabilized Aerial Unit · Sweeping Venue & Wedding Cinematography',
    aspect: 'portrait' as const,
  },
  {
    id: 3004,
    title: 'Sony α6700 + FE 50mm f/1.8 Prime',
    shortLabel: 'SONY α6700 + 50MM',
    tag: '4K MIRRORLESS',
    category: 'Studio Gear',
    location: 'Primary Portrait & Cinema Rig',
    imageUrl: '/assets/aistudio/2026-11-19_14.57.32_3f4f843c.jpg',
    exifMeta: 'Sony Alpha α6700 10-Bit 4:2:2 Cinema Body · Sony FE 50mm f/1.8 Prime Lens',
    aspect: 'portrait' as const,
  },
  {
    id: 3005,
    title: 'Sony α6700 + Sigma 18–50mm f/2.8',
    shortLabel: 'SIGMA f/2.8 ZOOM',
    tag: 'CINEMA ZOOM',
    category: 'Studio Gear',
    location: 'Outdoor Pre-Wedding & Field Rig',
    imageUrl: '/assets/aistudio/2026-11-19_14.57.40_a94dfe60.jpg',
    exifMeta: 'Sony α6700 · Sigma 18–50mm f/2.8 DC DN Constant-Aperture Cinema Zoom',
    aspect: 'portrait' as const,
  },
  {
    id: 3006,
    title: 'DJI Sunset RC & Drone Field Kit',
    shortLabel: 'DJI RC CONTROL',
    tag: 'FLIGHT CONTROL',
    category: 'Studio Gear',
    location: 'Golden Hour Aerial Operations',
    imageUrl: '/assets/aistudio/2026-11-19_14.57.36_e0fea79a.jpg',
    exifMeta: 'DJI Precision Dual-Stick RC Controller · Cine / Normal / Sport Aerial Modes',
    aspect: 'portrait' as const,
  },
  {
    id: 3007,
    title: 'Aerial Drone & Field Monitor Suite',
    shortLabel: 'AERIAL FLAT-LAY',
    tag: 'AERIAL SUITE',
    category: 'Studio Gear',
    location: 'Manish Cinematic Aerial Kit',
    imageUrl: '/assets/aistudio/2026-11-19_14.57.38_8c963504.jpg',
    exifMeta: 'DJI Mini 4K Drone · Long-Range RC Controller · Live HD Field Monitor',
    aspect: 'portrait' as const,
  },
  {
    id: 3008,
    title: 'DJI Mini Outdoor Launch Unit',
    shortLabel: 'READY TO FLY',
    tag: 'OUTDOOR DRONE',
    category: 'Studio Gear',
    location: 'On-Location Venue Coverage · Bihar',
    imageUrl: '/assets/aistudio/2026-11-19_14.57.34_22a5c974.jpg',
    exifMeta: 'DJI Mini Pre-Flight Launch Check · High-Altitude Wedding & Baraat Coverage',
    aspect: 'portrait' as const,
  },
];

// Reserved hero gear images & duplicate upload so no duplicate ever appears in the portrait gallery
const RESERVED_PAGE_IMAGES = new Set([
  ...HERO_EQUIPMENT_ITEMS.map((item) => item.imageUrl),
  '/assets/aistudio/2026-11-19_13.44.55_942c3ac0.jpg',
]);

const CURATED_GALLERY = [
  {
    id: 2001,
    title: 'Crimson Focus — Dual-Gel Studio Portrait',
    category: 'Studio Portraits',
    location: 'Manish Cinematic Studio, Begusarai',
    imageUrl: '/assets/aistudio/2026-11-19_13.45.19_6f2fb6c3.jpg',
    exifMeta: 'Real Camera Shot · 85mm f/1.8 Prime · Split Crimson & Cyan Studio Lighting',
    tall: true,
    isPortrait: true,
  },
  {
    id: 2002,
    title: 'Red Rim Editorial — Brick Wall Study',
    category: 'Studio Portraits',
    location: 'Teghra, Begusarai',
    imageUrl: '/assets/aistudio/2026-11-19_13.44.44_328bb63e.jpg',
    exifMeta: 'Real Camera Shot · 50mm f/1.8 · Warm Tungsten & Red Rim Gel',
    tall: true,
    isPortrait: true,
  },
  {
    id: 2003,
    title: 'Denim Afternoon — Natural Bokeh Portrait',
    category: 'Outdoor',
    location: 'Begusarai Outdoors',
    imageUrl: '/assets/aistudio/2026-11-19_13.45.00_681ea09c.jpg',
    exifMeta: 'Real Camera Shot · 85mm Telephoto · Natural Daylight Shallow Depth',
    tall: true,
    isPortrait: true,
  },
  {
    id: 2004,
    title: 'Shadow & Ember — Side Profile Noir',
    category: 'Studio Portraits',
    location: 'Manish Cinematic Darkroom',
    imageUrl: '/assets/aistudio/2026-11-19_13.44.49_afb377d5.jpg',
    exifMeta: 'Real Camera Shot · Low-Key Red Accent · Deep Shadow Profile',
    tall: true,
    isPortrait: true,
  },
  {
    id: 2005,
    title: 'Skyline Street Frame — Urban Action',
    category: 'Outdoor',
    location: 'Begusarai, Bihar',
    imageUrl: '/assets/aistudio/2026-11-19_13.45.08_508e406a.jpg',
    exifMeta: 'Real Camera Shot · High-Shutter Daylight · Open Sky Framing',
    tall: true,
    isPortrait: true,
  },
  {
    id: 2006,
    title: 'Close-Up Intensity — Crimson Key Light',
    category: 'Studio Portraits',
    location: 'Manish Cinematic Studio',
    imageUrl: '/assets/aistudio/2026-11-19_13.45.16_856a87fb.jpg',
    exifMeta: 'Real Camera Shot · Tight Portrait Frame · Dramatic Red Gel Key',
    tall: true,
    isPortrait: true,
  },
  {
    id: 2007,
    title: 'Golden Field Bokeh — Lifestyle Headshot',
    category: 'Outdoor',
    location: 'Begusarai Countryside',
    imageUrl: '/assets/aistudio/2026-11-19_13.45.12_7b56caa0.jpg',
    exifMeta: 'Real Camera Shot · 85mm f/1.8 · Natural Overcast Diffusion',
    tall: true,
    isPortrait: true,
  },
  {
    id: 2008,
    title: 'Silent Frame — Moody Hooded Study',
    category: 'Cinematic Mood',
    location: 'Short Film Still · Begusarai',
    imageUrl: '/assets/aistudio/2026-11-19_13.45.04_428ef2b2.jpg',
    exifMeta: 'Real Camera Shot · Dramatic Red Rim Light · Low-Key Short Film Frame',
    tall: true,
    isPortrait: true,
  },
  {
    id: 2009,
    title: 'Candid Motion — Outdoor Denim Editorial',
    category: 'Outdoor',
    location: 'Teghra, Begusarai',
    imageUrl: '/assets/aistudio/2026-11-19_13.44.35_328cbbb2.jpg',
    exifMeta: 'Real Camera Shot · Natural Light Candid · Creamy Green Bokeh',
    tall: true,
    isPortrait: true,
  },
];

const LOCAL_TESTIMONIALS = [
  {
    id: 1,
    clientName: 'Vivek Kumar & Ritu Kumari',
    clientRole: 'Wedding Photography',
    eventLocation: 'Teghra, Begusarai',
    quote:
      'Manish bhaiya aur unki poori team ka kaam ekdum next level hai. Haldi se leke bidai tak sab kuch itne ache se cover kiya ki teaser dekh ke ghar ke sabhi log emotional ho gaye. Begusarai me isse better cinema shoot nahi milega.',
    rating: 5,
  },
  {
    id: 2,
    clientName: 'Satyam Raj',
    clientRole: 'Pre-Wedding Shoot',
    eventLocation: 'Refinery Township, Barauni',
    quote:
      'हमारा प्री-वेडिंग शूट मनीष सिनेमैटिक के साथ बहुत ही शानदार रहा। ड्रोन शॉट्स और शाम की रोशनी में जो वीडियो बना है, बिल्कुल फिल्म जैसा लगता है। पूरी टीम बहुत ही मिलनसार और समय की पाबंद है।',
    rating: 5,
  },
  {
    id: 3,
    clientName: 'Priyanka & Abhishek Jha',
    clientRole: 'Cinematic Wedding Film',
    eventLocation: 'Har Har Mahadev Chowk, Begusarai',
    quote:
      "Booked Manish Cinematic for my sister's wedding and reception in Begusarai. Very polite team, no unnecessary attitude, and they delivered our 4K highlight video and album right on time. Totally worth every rupee.",
    rating: 5,
  },
  {
    id: 4,
    clientName: 'Roshan Kumar Yadav',
    clientRole: 'Studio Portrait Shoot',
    eventLocation: 'Bihat, Begusarai',
    quote:
      'Apne bhai ke engagement aur outdoor portrait shoot ke liye bulaya tha. Camera quality aur color grading sach me zabardast hai, photos bilkul natural aayi hain bina zyada over-edit kiye. Full paisa vasool!',
    rating: 5,
  },
  {
    id: 5,
    clientName: 'Kajal & Deepak Sharma',
    clientRole: 'Wedding Photography',
    eventLocation: 'Station Road, Samastipur',
    quote:
      'Wedding photos aur drone footage dono bohot pasand aaye sabko. Album printing ka quality bhi heavy aur premium tha. Bas final full video aane me 2-3 din thoda late hua tha wedding season ke wajah se, baki work 10/10 hai.',
    rating: 4,
  },
  {
    id: 6,
    clientName: 'Prashant Kumar Singh',
    clientRole: 'Cinematic Wedding Film',
    eventLocation: 'Mokama, Patna',
    quote:
      'मनीष जी का काम दिल जीत लेने वाला है। बारात का ड्रोन वीडियो और जयमाला का सिनेमैटिक शॉट देखकर सारे रिश्तेदार नंबर मांग रहे थे। बजट भी सही है और व्यवहार भी बहुत बढ़िया है।',
    rating: 5,
  },
];

export default function ManishCinematicPage() {
  const [activeView, setActiveView] = useState<'home' | 'portal'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Database catalog state
  const [services, setServices] = useState<StudioService[]>([]);
  const [packages, setPackages] = useState<StudioPackage[]>([]);
  const [addons, setAddons] = useState<StudioAddon[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [dbPortfolio, setDbPortfolio] = useState<PortfolioItem[]>([]);
  const [dbTestimonials, setDbTestimonials] = useState<StudioTestimonial[]>([]);

  // Free keyless Google Maps embed URL pinned to Manish Cinematic studio
  const mapEmbedUrl =
    'https://maps.google.com/maps?q=25.5035447,85.9278056&t=&z=16&ie=UTF8&iwloc=&output=embed';

  // Gallery filter & lightbox (supports both gallery photos & hero studio gear inspection)
  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [lightboxSource, setLightboxSource] = useState<'gallery' | 'equipment'>('gallery');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Showreel modal & per-video thumbnail fallback state
  const [activeShowreelIdx, setActiveShowreelIdx] = useState<number | null>(null);
  const [fallbackThumbIds, setFallbackThumbIds] = useState<Record<string, boolean>>({});

  // Booking mode toggle (Quick Mobile Form vs Full 8-Step Razorpay Wizard)
  const [bookingMode, setBookingMode] = useState<'quick' | 'wizard'>('quick');
  const [preselectedService, setPreselectedService] = useState<string>('Wedding Photography');
  const [wizardServiceSlug, setWizardServiceSlug] = useState<string>('wedding-photography');
  const [wizardKey, setWizardKey] = useState<number>(1);

  // Local confirmed bookings for instant Portal view
  const [recentLocalBookings, setRecentLocalBookings] = useState<StudioBooking[]>([]);
  const [recentLocalPayments, setRecentLocalPayments] = useState<StudioPayment[]>([]);

  // GSAP container refs
  const mainRef = useRef<HTMLDivElement | null>(null);
  const processSectionRef = useRef<HTMLElement | null>(null);
  const processTrackRef = useRef<HTMLDivElement | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setPackages(data.packages || []);
        setAddons(data.addons || []);
        setAvailabilitySlots(data.availabilitySlots || []);
        setDbPortfolio(data.portfolioItems || []);
        setDbTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error('Failed to fetch studio catalog:', err);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const localRaw = window.localStorage.getItem('mc_local_reviews');
        if (localRaw) {
          const parsed = JSON.parse(localRaw) as StudioTestimonial[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDbTestimonials((prev) => {
              const seen = new Set(prev.map((item) => item.id));
              return [...parsed.filter((item) => !seen.has(item.id)), ...prev];
            });
          }
        }
      } catch {
        // Ignore storage errors
      }
      void fetchCatalog();
    }, 0);
    return () => window.clearTimeout(id);
  }, [fetchCatalog]);

  // Combine curated gallery with any newly published Admin portfolio items (strictly deduplicated, zero legacy AI paths)
  const allGalleryItems = useMemo(() => {
    const existingUrls = new Set([
      ...CURATED_GALLERY.map((g) => g.imageUrl),
      ...Array.from(RESERVED_PAGE_IMAGES),
    ]);
    const extras = dbPortfolio
      .filter((p) => !existingUrls.has(p.imageUrl) && !p.imageUrl.includes('/src/assets/images/'))
      .map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        location: p.location,
        imageUrl: p.imageUrl,
        exifMeta: p.exifMeta,
        tall: true,
        isPortrait: true,
      }));
    return [...CURATED_GALLERY, ...extras];
  }, [dbPortfolio]);

  const galleryCategories = useMemo(() => {
    const cats = new Set<string>(['All']);
    allGalleryItems.forEach((item) => cats.add(item.category));
    return Array.from(cats);
  }, [allGalleryItems]);

  const filteredGallery = useMemo(() => {
    if (galleryFilter === 'All') return allGalleryItems;
    return allGalleryItems.filter(
      (item) => item.category.toLowerCase() === galleryFilter.toLowerCase()
    );
  }, [allGalleryItems, galleryFilter]);

  // Active lightbox items switch seamlessly between Hero Studio Gear and Visual Gallery
  const lightboxItems = useMemo(() => {
    if (lightboxSource === 'equipment') {
      return HERO_EQUIPMENT_ITEMS;
    }
    return filteredGallery;
  }, [lightboxSource, filteredGallery]);

  const allTestimonials = useMemo(() => {
    if (dbTestimonials.length > 0) {
      const dbMapped = dbTestimonials.map((t) => ({
        id: 10000 + t.id,
        clientName: t.clientName,
        clientRole: t.clientRole,
        eventLocation: t.eventLocation,
        quote: t.quote,
        rating: t.rating,
      }));
      const seenQuotes = new Set(dbMapped.map((item) => item.quote.trim().toLowerCase()));
      const uniqueLocal = LOCAL_TESTIMONIALS.filter(
        (item) => !seenQuotes.has(item.quote.trim().toLowerCase())
      );
      return [...dbMapped, ...uniqueLocal];
    }
    return LOCAL_TESTIMONIALS;
  }, [dbTestimonials]);

  // Keyboard shortcuts for Lightbox & Showreel Modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIdx(null);
        setActiveShowreelIdx(null);
      } else if (e.key === 'ArrowRight' && lightboxIdx !== null) {
        setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % lightboxItems.length));
      } else if (e.key === 'ArrowLeft' && lightboxIdx !== null) {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev - 1 + lightboxItems.length) % lightboxItems.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, lightboxItems.length]);

  // GSAP + ScrollTrigger Orchestration
  useEffect(() => {
    if (activeView !== 'home') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Hero slow zoom background
      gsap.fromTo(
        '.mc-hero-bg',
        { scale: 1.0 },
        {
          scale: 1.13,
          duration: 16,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        }
      );

      // 2. Hero line-by-line text reveal
      gsap.from('.mc-hero-line', {
        y: 44,
        opacity: 0,
        duration: 0.85,
        stagger: 0.14,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      // 3. Staggered reveal + anti-phase floating motion + scroll parallax on the 3 Hero equipment frames
      gsap.from('.mc-gear-card', {
        y: 36,
        scale: 0.93,
        opacity: 0,
        duration: 0.85,
        stagger: 0.14,
        ease: 'power3.out',
        clearProps: 'opacity,scale',
      });

      gsap.to('.mc-gear-float-main', {
        y: -10,
        duration: 3.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to('.mc-gear-float-left', {
        y: -13,
        rotation: -0.9,
        duration: 3.1,
        delay: 0.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to('.mc-gear-float-right', {
        y: -15,
        rotation: 0.9,
        duration: 3.4,
        delay: 0.85,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to('.mc-camera-parallax', {
        y: -55,
        ease: 'none',
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.1,
        },
      });

      gsap.to('.mc-gear-parallax-sub', {
        y: -85,
        ease: 'none',
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.4,
        },
      });

      // 4. Stats Counters count-up on scroll
      document.querySelectorAll<HTMLElement>('.mc-stat-number').forEach((el) => {
        const target = Number(el.dataset.target || '0');
        const suffix = el.dataset.suffix || '';
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#stats',
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = `${Math.round(obj.val)}${suffix}`;
          },
        });
      });

      // 4b. Pro Cinema Equipment cards stagger reveal on scroll
      gsap.from('.mc-arsenal-card', {
        y: 34,
        opacity: 0,
        scale: 0.96,
        duration: 0.65,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '#equipment',
          start: 'top 82%',
          once: true,
        },
      });

      // 5. Service cards stagger reveal on scroll
      gsap.from('.mc-service-card', {
        y: 36,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '#services',
          start: 'top 78%',
          once: true,
        },
      });

      // 6. Film-strip decorative parallax scroll
      gsap.to('.mc-film-strip', {
        xPercent: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.mc-film-strip-wrap',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // 7. Pinned Horizontal Scroll "Our Process" (Desktop >= 1024px)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        const section = processSectionRef.current;
        const track = processTrackRef.current;
        if (!section || !track) return;

        const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 120);

        gsap.to(track, {
          x: getScrollAmount,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 80px',
            end: () => `+=${Math.max(900, track.scrollWidth - window.innerWidth + 240)}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });

      // 8. Gallery cards fade & scale in on scroll
      gsap.from('.mc-gallery-item', {
        scale: 0.94,
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '#gallery',
          start: 'top 80%',
          once: true,
        },
      });
    }, mainRef);

    return () => {
      ctx.revert();
    };
  }, [activeView]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (activeView !== 'home') {
      setActiveView('home');
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceForBooking = (title: string, slug: string) => {
    setPreselectedService(title);
    setWizardServiceSlug(slug);
    setWizardKey((k) => k + 1);
    scrollToSection('booking');
  };

  const whatsappHeroUrl = `https://wa.me/918210057153?text=${encodeURIComponent(
    'Hello Manish Cinematic! I would like to book a shoot / check wedding dates in Begusarai.'
  )}`;

  return (
    <div ref={mainRef} className="min-h-screen flex flex-col bg-gradient-to-b from-[#3E0815] via-[#4E0B1B] to-[#2B060F] text-white">
      {/* Floating Progress Bar, Custom Red Cursor, WhatsApp Pulse Button & Maps Quota Guard */}
      <CinematicFloatingLayer />

      {/* 1. STICKY GLASS-BLUR NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[#D4AF37]/25 bg-[#2B060F]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            aria-label="Manish Cinematic Home"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600] rounded"
          >
            <ManishLogo />
          </a>

          {/* Desktop Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-300"
          >
            {[
              { label: 'Home', id: 'home' },
              { label: 'Services', id: 'services' },
              { label: 'Packages', id: 'packages' },
              { label: 'Gallery', id: 'gallery' },
              { label: 'Booking', id: 'booking' },
              { label: 'Reviews', id: 'reviews' },
              { label: 'Contact', id: 'contact' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className="hover:text-white relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#e10600] hover:after:w-full after:transition-all whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA + Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('booking')}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#e10600] hover:bg-[#c50500] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors whitespace-nowrap shrink-0 shadow-[0_0_24px_rgba(225,6,0,0.35)]"
            >
              Book Now
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2.5 rounded-lg border border-white/15 bg-white/5 text-white hover:border-[#e10600] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#D4AF37]/25 bg-[#2B060F]/95 backdrop-blur-xl px-6 py-5 space-y-4">
            <div className="flex flex-col space-y-2.5 text-sm font-medium">
              {[
                { label: 'Home', id: 'home' },
                { label: 'Services', id: 'services' },
                { label: 'Packages', id: 'packages' },
                { label: 'Gallery', id: 'gallery' },
                { label: 'Booking', id: 'booking' },
                { label: 'Reviews', id: 'reviews' },
                { label: 'Contact', id: 'contact' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="text-left py-2 text-neutral-200 hover:text-[#e10600] border-b border-white/5 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => scrollToSection('booking')}
                className="w-full py-3 rounded-lg bg-[#e10600] text-white text-sm font-semibold"
              >
                Book Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveView('portal');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 rounded-lg border border-white/15 text-xs text-neutral-300 hover:text-white"
              >
                Client Portal
              </button>
            </div>
          </div>
        )}
      </header>

      {/* CLIENT PORTAL VIEW */}
      {activeView === 'portal' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-8 lg:px-12 py-12">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4 text-[#e10600]" />
              Back to Manish Cinematic Studio
            </button>
          </div>
          <CustomerPortal
            recentLocalBookings={recentLocalBookings}
            recentLocalPayments={recentLocalPayments}
            onStartNewBooking={() => scrollToSection('booking')}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* 2. FULL-SCREEN CINEMATIC HERO SECTION */}
          <section
            id="home"
            className="relative min-h-[92vh] flex items-center overflow-hidden border-b border-white/10"
          >
            {/* Professional Cinema Camera & 4K Editing Suite Hero Background Image */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="mc-hero-bg relative w-full h-full">
                <ResilientImage
                  src="/assets/cinema_hero_backdrop_1795170914610.jpg"
                  alt="Professional cinema camera rig and 4K Indian wedding film color grading workstation"
                  loading="eager"
                  className="w-full h-full object-cover object-center lg:object-[62%_center] opacity-65 scale-[1.03]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at 72% 40%, rgba(225, 6, 0, 0.22) 0%, rgba(62, 8, 21, 0.38) 44%, rgba(43, 6, 15, 0.92) 82%)',
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#3E0815]/95 via-[#3E0815]/72 to-[#3E0815]/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E0815] via-transparent to-[#2B060F]/65" />
            </div>

            <div className="relative z-10 max-w-7xl w-full mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                {/* Left Column: Line-by-Line Reveal Headline & CTAs */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1.5">
                    <p className="mc-hero-line font-script text-2xl sm:text-3xl text-[#e10600]">
                      Dream • Shoot • Create
                    </p>
                    <p className="mc-hero-line text-xs sm:text-sm font-medium tracking-[0.22em] text-neutral-300 uppercase">
                      Short Film Maker | Cinematographer · Begusarai, Bihar
                    </p>
                  </div>

                  <h1 className="font-display font-black italic uppercase tracking-tight leading-[0.98] text-4xl sm:text-6xl lg:text-7xl text-white">
                    <span className="mc-hero-line block">Capture </span>
                    <span className="mc-hero-line block">Your Best </span>
                    <span className="mc-hero-line block text-[#e10600]">Moment</span>
                  </h1>

                  <p className="mc-hero-line text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                    Cinematic wedding films, soulful bridal portraits, pre-wedding stories, and original short films crafted in Begusarai, Bihar with cinema-grade optics and drone aerials.
                  </p>

                  <div className="mc-hero-line flex flex-wrap items-center gap-4 pt-2">
                    <a
                      href={whatsappHeroUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 rounded-xl bg-[#e10600] hover:bg-[#c50500] text-white text-sm font-semibold inline-flex items-center gap-2.5 transition-all shadow-[0_0_30px_rgba(225,6,0,0.4)] whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Book on WhatsApp
                    </a>

                    <button
                      type="button"
                      onClick={() => scrollToSection('gallery')}
                      className="px-6 py-3.5 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 hover:border-white/50 text-white text-sm font-semibold inline-flex items-center gap-2.5 transition-all whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 text-[#e10600] fill-[#e10600]" />
                      View Our Work
                    </button>
                  </div>

                  <div className="mc-hero-line pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                    <a
                      href={SOCIAL_LINKS.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open Manish Cinematic studio location in Google Maps"
                      className="text-neutral-300 hover:text-[#e10600] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#e10600]" />
                      <span>Ayodhya Chowk Tegra, Begusarai</span>
                    </a>
                    <span aria-hidden="true">·</span>
                    <a
                      href="tel:+918210057153"
                      aria-label="Call Manish Cinematic"
                      className="text-neutral-200 hover:text-[#e10600] inline-flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#e10600]" />
                      Call Studio
                    </a>
                    <span aria-hidden="true">·</span>
                    <a
                      href={SOCIAL_LINKS.gmail}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Send email to Manish Cinematic via Gmail"
                      className="text-neutral-200 hover:text-[#e10600] inline-flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#e10600]" />
                      Email via Gmail
                    </a>
                    <span aria-hidden="true">·</span>
                    <span className="text-white font-medium">Starting ₹15,000/-</span>
                  </div>
                </div>

                {/* Right Column: Animated 3-Piece Studio Equipment Showcase with Precision Crimson Outlines */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-lg space-y-4">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-8 rounded-full bg-[#e10600]/20 blur-3xl pointer-events-none"
                    />

                    {/* Primary Widescreen Card: 4K Editing & Color Grading Suite */}
                    <div className="mc-camera-parallax">
                      <div
                        onClick={() => {
                          setLightboxSource('equipment');
                          setLightboxIdx(0);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setLightboxSource('equipment');
                            setLightboxIdx(0);
                          }
                        }}
                        aria-label="Inspect Manish Cinematic 4K Editing Suite"
                        className="mc-gear-card mc-gear-float-main cinema-gear-frame group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600]"
                      >
                        {/* Precision Viewfinder Corner Outlines */}
                        <span className="vf-corner top-2.5 left-2.5 border-t-2 border-l-2 rounded-tl-sm" />
                        <span className="vf-corner top-2.5 right-2.5 border-t-2 border-r-2 rounded-tr-sm" />
                        <span className="vf-corner bottom-2.5 left-2.5 border-b-2 border-l-2 rounded-bl-sm" />
                        <span className="vf-corner bottom-2.5 right-2.5 border-b-2 border-r-2 rounded-br-sm" />

                        <div className="cinema-gear-inner">
                          <ResilientImage
                            src={HERO_EQUIPMENT_ITEMS[0].imageUrl}
                            alt={HERO_EQUIPMENT_ITEMS[0].title}
                            className="w-full aspect-[16/9] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#29050E]/90 via-transparent to-[#29050E]/25" />
                          <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between text-[10px] font-semibold tracking-[0.2em] uppercase">
                            <span className="text-white/90 bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15">
                              {HERO_EQUIPMENT_ITEMS[0].tag}
                            </span>
                            <span className="text-[#e10600] bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-[#e10600]/40">
                              4K SUITE
                            </span>
                          </div>
                          <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-2">
                            <div>
                              <span className="font-display italic font-bold text-sm sm:text-base text-white tracking-wide block leading-tight">
                                {HERO_EQUIPMENT_ITEMS[0].title}
                              </span>
                              <span className="text-[11px] text-neutral-300">
                                In-House Color Grading & Sound Mastering
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dual Vertical Satellite Equipment Cards: DJI Ronin Gimbal & DJI Mini 4K Drone */}
                    <div className="mc-gear-parallax-sub grid grid-cols-2 gap-4">
                      {HERO_EQUIPMENT_ITEMS.slice(1, 3).map((gear, subIdx) => {
                        const gearIndex = subIdx + 1;
                        const floatClass =
                          subIdx === 0 ? 'mc-gear-float-left' : 'mc-gear-float-right';
                        return (
                          <div
                            key={gear.id}
                            onClick={() => {
                              setLightboxSource('equipment');
                              setLightboxIdx(gearIndex);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setLightboxSource('equipment');
                                setLightboxIdx(gearIndex);
                              }
                            }}
                            aria-label={`Inspect ${gear.title}`}
                            className={`mc-gear-card ${floatClass} cinema-gear-frame group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600]`}
                          >
                            <span className="vf-corner top-2 left-2 border-t-2 border-l-2 rounded-tl-sm" />
                            <span className="vf-corner top-2 right-2 border-t-2 border-r-2 rounded-tr-sm" />
                            <span className="vf-corner bottom-2 left-2 border-b-2 border-l-2 rounded-bl-sm" />
                            <span className="vf-corner bottom-2 right-2 border-b-2 border-r-2 rounded-br-sm" />

                            <div className="cinema-gear-inner">
                              <ResilientImage
                                src={gear.imageUrl}
                                alt={gear.title}
                                className="w-full aspect-[4/5] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#29050E]/95 via-[#29050E]/15 to-transparent" />
                              <div className="absolute top-3 left-3">
                                <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-white/95 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-[#e10600]/45">
                                  {gear.tag}
                                </span>
                              </div>
                              <div className="absolute bottom-3 left-3 right-3">
                                <span className="font-display italic font-bold text-xs sm:text-sm text-white tracking-wide block leading-tight">
                                  {gear.shortLabel}
                                </span>
                                <span className="text-[10px] text-neutral-300 line-clamp-1">
                                  {gear.title}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Scroll-Down Indicator */}
            <button
              type="button"
              onClick={() => scrollToSection('stats')}
              aria-label="Scroll down to studio stats"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <span className="tracking-widest uppercase text-[10px]">Scroll</span>
              <ChevronDown className="w-5 h-5 text-[#e10600] animate-bounce" />
            </button>
          </section>

          {/* 3. ANIMATED STATS COUNTERS */}
          <section id="stats" className="py-14 sm:py-16 border-b border-white/10 bg-[#320611]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {STUDIO_STATS.map((stat) => (
                  <div
                    key={stat.id}
                    className="text-center lg:text-left p-5 rounded-2xl border border-white/10 bg-[#29050E]"
                  >
                    <div
                      className="mc-stat-number font-display font-black italic text-4xl sm:text-5xl text-white tabular-nums"
                      data-target={stat.target}
                      data-suffix={stat.suffix}
                    >
                      {stat.target}
                      {stat.suffix}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3B. PRO CINEMA EQUIPMENT SHOWCASE (5 ADDITIONAL REAL GEAR PHOTOS) */}
          <section id="equipment" className="py-16 sm:py-20 border-b border-white/10 bg-[#3E0815]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="font-script text-2xl text-[#e10600]">Behind Every Frame</p>
                  <h2
                    className="font-display font-black italic uppercase text-3xl sm:text-5xl text-white mt-1 tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Our Pro Cinema Gear
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-sm">
                    Sony Alpha 4K cinema bodies, Sigma f/2.8 optics, DJI Ronin gimbals, and 4K aerial drones ready for your shoot.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxSource('equipment');
                      setLightboxIdx(0);
                    }}
                    className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#e10600]/50 bg-[#e10600]/10 hover:bg-[#e10600] text-white text-xs font-semibold transition-all"
                  >
                    <Aperture className="w-4 h-4" />
                    View All {HERO_EQUIPMENT_ITEMS.length} Gear Photos
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {HERO_EQUIPMENT_ITEMS.slice(3).map((gear, idx) => {
                  const fullGearIndex = idx + 3;
                  return (
                    <div
                      key={gear.id}
                      onClick={() => {
                        setLightboxSource('equipment');
                        setLightboxIdx(fullGearIndex);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setLightboxSource('equipment');
                          setLightboxIdx(fullGearIndex);
                        }
                      }}
                      aria-label={`Inspect ${gear.title}`}
                      className={`mc-arsenal-card cinema-gear-frame group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600] ${
                        idx === 0 ? 'col-span-2 sm:col-span-1' : ''
                      }`}
                    >
                      <span className="vf-corner top-2 left-2 border-t-2 border-l-2 rounded-tl-sm" />
                      <span className="vf-corner top-2 right-2 border-t-2 border-r-2 rounded-tr-sm" />
                      <span className="vf-corner bottom-2 left-2 border-b-2 border-l-2 rounded-bl-sm" />
                      <span className="vf-corner bottom-2 right-2 border-b-2 border-r-2 rounded-br-sm" />

                      <div className="cinema-gear-inner">
                        <ResilientImage
                          src={gear.imageUrl}
                          alt={gear.title}
                          className={`w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ${
                            idx === 0 ? 'aspect-[16/10] sm:aspect-[3/4]' : 'aspect-[3/4]'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#29050E]/95 via-[#29050E]/20 to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-semibold tracking-[0.16em] uppercase text-white/95 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-[#e10600]/45">
                            {gear.tag}
                          </span>
                          <span className="text-[9px] font-mono text-white/75 bg-black/55 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 tabular-nums">
                            0{fullGearIndex + 1}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="font-display italic font-bold text-xs sm:text-sm text-white tracking-wide block leading-tight">
                            {gear.shortLabel}
                          </span>
                          <span className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5 block">
                            {gear.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 4. SERVICES SECTION (6 CARDS WITH HOVER TILT & GLOW) */}
          <section id="services" className="py-20 lg:py-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <p className="font-script text-2xl text-[#e10600]">What We Craft</p>
                  <h2
                    className="font-display font-black italic uppercase text-3xl sm:text-5xl text-white mt-1 tracking-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Our Signature Services
                  </h2>
                </div>
                <p className="text-sm text-neutral-400 max-w-md">
                  From grand Indian weddings in Begusarai to narrative short films, every shoot is directed with cinematic precision.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MANISH_SERVICES.map((service, idx) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.title}
                      onClick={() => handleSelectServiceForBooking(service.title, service.slug)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectServiceForBooking(service.title, service.slug);
                        }
                      }}
                      className="mc-service-card service-tilt-card cursor-pointer p-7 rounded-2xl border border-white/10 bg-[#29050E] flex flex-col justify-between space-y-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600]"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-xl bg-[#e10600]/15 border border-[#e10600]/40 text-[#e10600] flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="font-display italic font-bold text-sm text-neutral-500 tabular-nums">
                            0{idx + 1}
                          </span>
                        </div>
                        <h3 className="font-display font-extrabold italic text-xl sm:text-2xl text-white">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#e10600]">
                        <span>Book This Service</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* FILM-STRIP PARALLAX DECORATIVE ELEMENT */}
          <div
            aria-hidden="true"
            className="mc-film-strip-wrap overflow-hidden border-b border-white/10 bg-[#320611] py-3 select-none"
          >
            <div className="film-strip-band h-3 w-full opacity-80 mb-2" />
            <div className="mc-film-strip flex items-center gap-10 whitespace-nowrap w-[200%] font-display font-extrabold italic uppercase tracking-[0.22em] text-xs sm:text-sm text-neutral-400">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="inline-flex items-center gap-8">
                  <span className="text-white">MANISH CINEMATIC</span>
                  <span className="text-[#e10600]">•</span>
                  <span>DREAM • SHOOT • CREATE</span>
                  <span className="text-[#e10600]">•</span>
                  <span>BEGUSARAI, BIHAR</span>
                  <span className="text-[#e10600]">•</span>
                </span>
              ))}
            </div>
            <div className="film-strip-band h-3 w-full opacity-80 mt-2" />
          </div>

          {/* 5. PINNED HORIZONTAL SCROLL SECTION: "OUR PROCESS" */}
          <section
            ref={processSectionRef}
            id="process"
            className="py-20 lg:py-24 border-b border-white/10 bg-[#3E0815] overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="font-script text-2xl text-[#e10600]">From Vision to Cinema</p>
                  <h2 className="font-display font-black italic uppercase text-3xl sm:text-5xl text-white mt-1">
                    Our Process
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Enquiry → Planning → Shoot → Editing → Delivery
                </p>
              </div>
            </div>

            {/* Horizontal Track (GSAP-pinned on desktop, smooth snap-scroll on mobile) */}
            <div className="px-5 sm:px-8 lg:px-12 overflow-x-auto lg:overflow-visible pb-4">
              <div
                ref={processTrackRef}
                className="flex gap-6 w-max lg:will-change-transform"
              >
                {PROCESS_STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    className="w-[82vw] sm:w-[360px] lg:w-[390px] shrink-0 p-7 rounded-2xl border border-white/10 bg-[#29050E] relative flex flex-col justify-between min-h-[270px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="font-display font-black italic text-4xl text-[#e10600] tabular-nums">
                          {step.num}
                        </span>
                        <span className="text-xs text-neutral-400 tracking-wide">
                          {step.subtitle}
                        </span>
                      </div>
                      <h3 className="font-display font-extrabold italic uppercase text-2xl text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-neutral-400 mt-3 leading-relaxed">{step.desc}</p>
                    </div>

                    <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-neutral-500">
                      <span>Stage {i + 1} of 5</span>
                      {i < PROCESS_STEPS.length - 1 ? (
                        <span className="text-[#e10600] inline-flex items-center gap-1 font-medium">
                          Next: {PROCESS_STEPS[i + 1].title}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">Ready to Relive Forever</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. PACKAGES & PRICING SECTION (BIHAR WEDDING, REELS, PRE-WEDDING, BUSINESS & ADD-ONS) */}
          <PackagesPricingSection
            onCheckAvailability={() => scrollToSection('booking')}
          />

          {/* 7. MASONRY GALLERY WITH CATEGORY FILTER & LIGHTBOX */}
          <section id="gallery" className="py-20 lg:py-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="font-script text-2xl text-[#e10600]">Selected Frames</p>
                  <h2 className="font-display font-black italic uppercase text-3xl sm:text-5xl text-white mt-1">
                    Visual Gallery
                  </h2>
                </div>

                {/* Interactive Category Filter Buttons */}
                <div
                  role="tablist"
                  aria-label="Gallery Categories"
                  className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#29050E] border border-white/10"
                >
                  {galleryCategories.map((cat) => {
                    const count =
                      cat === 'All'
                        ? allGalleryItems.length
                        : allGalleryItems.filter(
                            (item) => item.category.toLowerCase() === cat.toLowerCase()
                          ).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        role="tab"
                        aria-selected={galleryFilter === cat}
                        onClick={() => {
                          setLightboxIdx(null);
                          setGalleryFilter(cat);
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                          galleryFilter === cat
                            ? 'bg-[#e10600] text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`text-[10px] tabular-nums ${
                            galleryFilter === cat ? 'text-white/80' : 'text-neutral-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 mb-7">
                100% real camera captures by Manish Cinematic. Click any photograph to explore full-frame lighting and resolution in the viewer.
              </p>

              {/* Balanced 3-Column Editorial Grid (3 clean rows of 3 for all 9 real camera portraits) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGallery.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setLightboxSource('gallery');
                      setLightboxIdx(idx);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setLightboxSource('gallery');
                        setLightboxIdx(idx);
                      }
                    }}
                    className="mc-gallery-item group relative rounded-2xl overflow-hidden border border-white/15 hover:border-[#e10600]/80 bg-[#29050E] cursor-pointer transition-all hover:shadow-[0_12px_36px_-12px_rgba(225,6,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600]"
                  >
                    <ResilientImage
                      src={item.imageUrl}
                      alt={`${item.title} — Manish Cinematic ${item.category}`}
                      className="w-full aspect-[3/4] object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-[11px] text-[#e10600] font-semibold uppercase tracking-wider">
                        {item.category} · <span className="text-neutral-300">{item.location}</span>
                      </div>
                      <h3 className="font-display font-bold italic text-base sm:text-lg text-white mt-0.5 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                        {item.exifMeta}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 8. SHOWREEL & FEATURED YOUTUBE VIDEO PREVIEWS WITH MODAL PLAYER */}
          <section id="showreel" className="py-20 lg:py-24 border-b border-white/10 bg-[#320611]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="font-script text-2xl text-[#e10600]">Watch Us In Motion</p>
                <h2 className="font-display font-black italic uppercase text-3xl sm:text-5xl text-white mt-1">
                  Official Cinema Showreels
                </h2>
                <p className="text-sm text-neutral-300 mt-2.5">
                  Preview our real wedding films, reels &amp; cinematic direction directly from YouTube.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {FEATURED_SHOWREEL_VIDEOS.map((video, idx) => {
                  const thumbSrc = fallbackThumbIds[video.id] ? video.thumbHq : video.thumbHd;
                  return (
                    <div key={video.id} className="space-y-3.5">
                      <div
                        onClick={() => setActiveShowreelIdx(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setActiveShowreelIdx(idx);
                          }
                        }}
                        aria-label={`Play ${video.title}`}
                        className="group relative aspect-video w-full rounded-3xl overflow-hidden border border-[#D4AF37]/30 hover:border-[#e10600]/80 bg-[#1B050B] cursor-pointer shadow-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600]"
                      >
                        {/* Live YouTube Video Preview Thumbnail */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbSrc}
                          alt={`${video.title} — Manish Cinematic YouTube Preview`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onLoad={(e) => {
                            if (
                              !fallbackThumbIds[video.id] &&
                              e.currentTarget.naturalWidth <= 120
                            ) {
                              setFallbackThumbIds((prev) => ({ ...prev, [video.id]: true }));
                            }
                          }}
                          onError={() => {
                            if (!fallbackThumbIds[video.id]) {
                              setFallbackThumbIds((prev) => ({ ...prev, [video.id]: true }));
                            }
                          }}
                          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="film-strip-band absolute top-0 left-0 right-0 h-3 opacity-65 pointer-events-none" />
                        <div className="film-strip-band absolute bottom-0 left-0 right-0 h-3 opacity-65 pointer-events-none" />

                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-black/65 backdrop-blur-md border border-[#D4AF37]/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F3D27A]">
                            <Youtube className="w-3.5 h-3.5 text-[#e10600]" />
                            {video.badge}
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-[#29050E]/95 via-[#29050E]/35 to-[#29050E]/20 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#e10600] text-white flex items-center justify-center shadow-[0_0_45px_rgba(225,6,0,0.65)] group-hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                          </div>
                          <p className="font-display font-extrabold italic uppercase text-lg sm:text-2xl text-white mt-5 tracking-wide drop-shadow">
                            {video.title}
                          </p>
                          <p className="text-xs sm:text-sm text-neutral-200 mt-1">
                            {video.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 px-1">
                        <button
                          type="button"
                          onClick={() => setActiveShowreelIdx(idx)}
                          className="text-xs font-semibold text-[#F3D27A] hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Play Preview Here
                        </button>
                        <a
                          href={video.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-neutral-200 hover:text-[#e10600] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Youtube className="w-3.5 h-3.5 text-[#e10600]" />
                          Open on YouTube
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-[#e10600] hover:bg-[#c50500] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2.5 transition-colors shadow-lg"
                >
                  <Youtube className="w-4 h-4" />
                  Visit Full YouTube Channel (@biharmanishcinematic)
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>
          </section>

          {/* 9. BOOKING SECTION (QUICK FORM + FULL 8-STEP ADVANCE PAYMENT WIZARD) */}
          <section id="booking" className="py-20 lg:py-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="font-script text-2xl text-[#e10600]">Lock Your Wedding Date</p>
                  <h2 className="font-display font-black italic uppercase text-3xl sm:text-5xl text-white mt-1">
                    Book Your Shoot
                  </h2>
                </div>

                {/* Mode Switcher */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#29050E] border border-white/10">
                  <button
                    type="button"
                    onClick={() => setBookingMode('quick')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      bookingMode === 'quick'
                        ? 'bg-[#e10600] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Quick Booking Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode('wizard')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      bookingMode === 'wizard'
                        ? 'bg-[#e10600] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    8-Step Package & Razorpay Advance
                  </button>
                </div>
              </div>

              {bookingMode === 'quick' ? (
                <QuickBookingForm
                  packages={packages}
                  availabilitySlots={availabilitySlots}
                  preselectedService={preselectedService}
                  onSwitchToWizard={() => setBookingMode('wizard')}
                  onBookingCreated={(b) => {
                    setRecentLocalBookings((prev) => [b, ...prev]);
                    void fetchCatalog();
                  }}
                />
              ) : (
                services.length > 0 && (
                  <BookingWizard
                    key={wizardKey}
                    services={services}
                    packages={packages}
                    addons={addons}
                    availabilitySlots={availabilitySlots}
                    initialServiceSlug={wizardServiceSlug}
                    onBookingConfirmed={(newBooking, newPayment) => {
                      setRecentLocalBookings((prev) => [newBooking, ...prev]);
                      setRecentLocalPayments((prev) => [newPayment, ...prev]);
                      void fetchCatalog();
                    }}
                    onOpenCustomerPortal={() => {
                      setActiveView('portal');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )
              )}
            </div>
          </section>

          {/* 10. INTERACTIVE CLIENT REVIEWS & RATINGS SECTION */}
          <ClientReviewsSection
            reviews={allTestimonials}
            onReviewAdded={(newReview) => {
              setDbTestimonials((prev) => [
                newReview,
                ...prev.filter((item) => item.id !== newReview.id),
              ]);
            }}
          />

          {/* 11. CONTACT SECTION WITH GOOGLE MAP FOR AYODHYA CHOWK TEGRA, BEGUSARAI */}
          <section id="contact" className="py-20 lg:py-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
              <div className="mb-12">
                <p className="font-script text-2xl text-[#e10600]">Visit Our Studio</p>
                <h2 className="font-display font-black italic uppercase text-3xl sm:text-5xl text-white mt-1">
                  Contact Manish Cinematic
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Address, Click-to-Call, WhatsApp & Social Buttons */}
                <div className="lg:col-span-5 p-7 sm:p-8 rounded-2xl border border-white/10 bg-[#29050E] flex flex-col justify-between space-y-6">
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#e10600] font-semibold">
                        Studio Address
                      </p>
                      <a
                        href={SOCIAL_LINKS.googleMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open Manish Cinematic studio location in Google Maps"
                        className="text-lg font-semibold text-white hover:text-[#e10600] mt-1.5 inline-flex items-start gap-2.5 transition-colors"
                      >
                        <MapPin className="w-5 h-5 text-[#e10600] shrink-0 mt-0.5" />
                        <span>Ayodhya Chowk Tegra, Begusarai, Bihar</span>
                      </a>
                      <p className="text-xs text-neutral-400 mt-1 pl-7">
                        Open Daily: 9:00 AM – 9:00 PM · Available Across Bihar & All India
                      </p>
                    </div>

                    <div className="space-y-3">
                      <a
                        href="tel:+918210057153"
                        aria-label="Call Manish Cinematic"
                        className="w-full py-3.5 px-5 rounded-xl bg-[#e10600] hover:bg-[#c50500] text-white text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call Studio Now
                      </a>

                      <a
                        href={whatsappHeroUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Message Manish Cinematic on WhatsApp"
                        className="w-full py-3.5 px-5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/60 hover:bg-[#25D366]/25 text-[#4ade80] text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message on WhatsApp
                      </a>

                      <a
                        href={SOCIAL_LINKS.gmail}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Send email to Manish Cinematic on Gmail"
                        className="w-full py-3.5 px-5 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:bg-[#e10600]/10 text-white text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors"
                      >
                        <Mail className="w-4 h-4 text-[#e10600]" />
                        Send Email via Gmail
                      </a>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs text-neutral-400 mb-3">
                      Follow & Connect on Social Media & Maps
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={SOCIAL_LINKS.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:bg-[#e10600]/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        <Youtube className="w-4 h-4 text-[#e10600] shrink-0" />
                        <span>YouTube</span>
                      </a>
                      <a
                        href={SOCIAL_LINKS.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:bg-[#e10600]/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        <Instagram className="w-4 h-4 text-[#e10600] shrink-0" />
                        <span>Instagram</span>
                      </a>
                      <a
                        href={SOCIAL_LINKS.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:bg-[#e10600]/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        <Facebook className="w-4 h-4 text-[#e10600] shrink-0" />
                        <span>Facebook</span>
                      </a>
                      <a
                        href={SOCIAL_LINKS.googleMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:bg-[#e10600]/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-[#e10600] shrink-0" />
                        <span>Google Maps</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Column: Embedded Google Map for Ayodhya Chowk Tegra, Begusarai */}
                <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-white/10 bg-[#29050E] min-h-[380px] flex flex-col">
                  <div className="px-4 py-3 border-b border-white/10 bg-[#320611] flex items-center justify-between gap-3">
                    <a
                      href={SOCIAL_LINKS.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open Manish Cinematic studio location in Google Maps"
                      className="text-xs font-medium text-neutral-300 hover:text-[#e10600] flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#e10600]" />
                      Ayodhya Chowk Tegra, Begusarai
                    </a>
                    <a
                      href={SOCIAL_LINKS.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#e10600] hover:bg-[#c50500] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      Open in Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {mapEmbedUrl ? (
                    <iframe
                      title="Manish Cinematic Studio Map — Ayodhya Chowk Tegra, Begusarai"
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      className="w-full flex-1 min-h-[340px] border-0"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 text-sm">
                      <MapPin className="w-8 h-8 text-[#e10600] mb-2" />
                      <p>Loading Google Map for Ayodhya Chowk Tegra, Begusarai...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* 12. FOOTER */}
      <footer className="bg-[#22040B] border-t border-[#D4AF37]/25 pt-14 pb-24 md:pb-14 text-xs text-neutral-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3">
            <ManishLogo />
            <p className="font-script text-xl text-[#e10600] pt-1">Dream • Shoot • Create</p>
            <p className="leading-relaxed">
              Short Film Maker | Cinematographer — Wedding photography, pre-wedding shoots, and cinematic wedding films in Begusarai, Bihar.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold italic uppercase text-sm text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', id: 'home' },
                { label: 'Services', id: 'services' },
                { label: 'Packages', id: 'packages' },
                { label: 'Gallery', id: 'gallery' },
                { label: 'Booking', id: 'booking' },
                { label: 'Contact', id: 'contact' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="hover:text-[#e10600] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold italic uppercase text-sm text-white mb-4">
              Studio Portal & Tools
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('portal');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 hover:text-[#e10600] transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#e10600]" />
                  Client Account & Receipts
                </button>
              </li>
              <li>
                <a
                  href="tel:+918210057153"
                  aria-label="Call Manish Cinematic"
                  className="hover:text-[#e10600] transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#e10600]" />
                  Call Studio
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.gmail}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Send email to Manish Cinematic via Gmail"
                  className="hover:text-[#e10600] transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#e10600]" />
                  Send Email (Gmail)
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e10600] transition-colors inline-flex items-center gap-1"
                >
                  Ayodhya Chowk Tegra, Begusarai
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold italic uppercase text-sm text-white mb-4">
              Connect With Us
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Manish Cinematic on YouTube"
                className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:text-[#e10600] text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Manish Cinematic on Instagram"
                className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:text-[#e10600] text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Manish Cinematic on Facebook"
                className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:text-[#e10600] text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Manish Cinematic on Google Maps"
                className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:text-[#e10600] text-white flex items-center justify-center transition-colors"
              >
                <MapPin className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.gmail}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send Email to Manish Cinematic on Gmail"
                className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:text-[#e10600] text-white flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={whatsappHeroUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Manish Cinematic on WhatsApp"
                className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 hover:border-[#25D366] hover:text-[#25D366] text-white flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="tel:+918210057153"
                aria-label="Call Manish Cinematic"
                className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 hover:border-[#e10600] hover:text-[#e10600] text-white flex items-center justify-center transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Local SEO Coverage Strip — Bihar Districts & Shoot Services */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mt-10 pt-6 border-t border-[#D4AF37]/20 space-y-2.5 text-[11px] text-neutral-300/85">
          <p className="leading-relaxed">
            <span className="font-semibold text-[#F3D27A] uppercase tracking-wider mr-2">
              Serving Across Bihar:
            </span>
            Teghra · Begusarai · Barauni · Bihat · Bachhwara · Bakhri · Samastipur · Khagaria · Lakhisarai · Mokama · Munger · Patna · Darbhanga · Muzaffarpur · Hajipur · Bhagalpur · Nalanda · Gaya · Purnia
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-[#F3D27A] uppercase tracking-wider mr-2">
              Popular Shoots:
            </span>
            Wedding Photography &amp; 4K Cinema Films · Shaadi Reels (24–48 Hr) · Pre-Wedding Shoot in Bihar · Coaching Centre &amp; Dukaan Promotional Reels · 4K Aerial Drone Coverage · Engagement, Birthday &amp; Chhath Puja Reels · Short Films
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-300 font-medium">© Manish Cinematic. All Rights Reserved.</p>
          <a
            href={SOCIAL_LINKS.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e10600] inline-flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#e10600]" />
            Ayodhya Chowk Tegra, Begusarai, Bihar
          </a>
        </div>
      </footer>

      {/* GALLERY LIGHTBOX MODAL */}
      {lightboxIdx !== null && lightboxItems[lightboxIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
          className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <div className="relative max-w-5xl w-full rounded-2xl border border-white/15 bg-[#29050E] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-xs text-[#e10600] font-semibold uppercase">
                  {lightboxItems[lightboxIdx].category} · {lightboxItems[lightboxIdx].location} ·{' '}
                  <span className="text-neutral-400 tabular-nums">
                    {lightboxIdx + 1} / {lightboxItems.length}
                  </span>
                </p>
                <h3 className="font-display font-bold italic text-lg text-white">
                  {lightboxItems[lightboxIdx].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIdx(null)}
                aria-label="Close lightbox"
                className="p-2 rounded-lg bg-white/10 hover:bg-[#e10600] text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <ResilientImage
                src={lightboxItems[lightboxIdx].imageUrl}
                alt={lightboxItems[lightboxIdx].title}
                className="max-h-[70vh] w-auto object-contain"
              />

              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setLightboxIdx(
                    (prev) =>
                      prev === null
                        ? null
                        : (prev - 1 + lightboxItems.length) % lightboxItems.length
                  )
                }
                className="absolute left-3 p-2.5 rounded-full bg-black/70 hover:bg-[#e10600] text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() =>
                  setLightboxIdx((prev) =>
                    prev === null ? null : (prev + 1) % lightboxItems.length
                  )
                }
                className="absolute right-3 p-2.5 rounded-full bg-black/70 hover:bg-[#e10600] text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-neutral-400">
                {lightboxItems[lightboxIdx].exifMeta}
              </span>
              <button
                type="button"
                onClick={() => {
                  const cat = lightboxItems[lightboxIdx].category;
                  setLightboxIdx(null);
                  handleSelectServiceForBooking(
                    cat === 'Cinematic Mood'
                      ? 'Short Films'
                      : cat === 'Outdoor'
                      ? 'Pre-Wedding Shoot'
                      : 'Wedding Photography',
                    cat === 'Cinematic Mood' || cat === 'Studio Portraits'
                      ? 'fashion-portfolio'
                      : cat === 'Outdoor'
                      ? 'pre-wedding'
                      : 'wedding-photography'
                  );
                }}
                className="px-5 py-2 rounded-lg bg-[#e10600] hover:bg-[#c50500] text-white text-xs font-semibold"
              >
                Book Similar Shoot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOWREEL YOUTUBE VIDEO MODAL */}
      {activeShowreelIdx !== null && FEATURED_SHOWREEL_VIDEOS[activeShowreelIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={FEATURED_SHOWREEL_VIDEOS[activeShowreelIdx].title}
          className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <div className="relative max-w-5xl w-full rounded-2xl border border-[#D4AF37]/35 bg-[#29050E] overflow-hidden shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <ManishLogo compact />
                <span className="text-xs text-neutral-300 truncate hidden sm:inline">
                  {FEATURED_SHOWREEL_VIDEOS[activeShowreelIdx].title}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Quick Switch Between Both Videos */}
                <div className="inline-flex items-center rounded-lg border border-white/15 bg-[#22040B] p-0.5 text-[11px]">
                  {FEATURED_SHOWREEL_VIDEOS.map((vid, idx) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setActiveShowreelIdx(idx)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        activeShowreelIdx === idx
                          ? 'bg-[#e10600] text-white'
                          : 'text-neutral-300 hover:text-white'
                      }`}
                    >
                      Video {idx + 1}
                    </button>
                  ))}
                </div>
                <a
                  href={FEATURED_SHOWREEL_VIDEOS[activeShowreelIdx].watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:border-[#e10600] text-xs font-medium text-neutral-200 hover:text-white transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5 text-[#e10600]" />
                  Watch on YouTube
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveShowreelIdx(null)}
                  aria-label="Close showreel modal"
                  className="p-2 rounded-lg bg-white/10 hover:bg-[#e10600] text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                key={FEATURED_SHOWREEL_VIDEOS[activeShowreelIdx].id}
                title={FEATURED_SHOWREEL_VIDEOS[activeShowreelIdx].title}
                src={FEATURED_SHOWREEL_VIDEOS[activeShowreelIdx].embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
