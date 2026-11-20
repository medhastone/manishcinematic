import type { Metadata } from 'next';

export const BRAND_NAME = 'Manish Cinematic';
export const DOMAIN_DISPLAY = 'ManishCinematic.in';
export const SITE_URL = (process.env.APP_URL || 'https://manishcinematic.in').replace(/\/+$/, '');
export const PRIMARY_OG_IMAGE = '/assets/cinema_hero_backdrop_1795170914610.jpg';
export const STUDIO_OG_IMAGE = '/assets/aistudio/2026-11-19_14.43.52_c4eb0004.jpg';
export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/manishcinematic+video+and+photo+photographer/@25.5035447,85.9252307,1419m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39f273aa7eaa3209:0x130f2bb553405f7!8m2!3d25.5035447!4d85.9278056!16s%2Fg%2F11zkvwx_91?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MTExNi4wIKXMDSoASAFQAw%3D%3D';

export const BIHAR_SERVICE_CITIES = [
  'Begusarai',
  'Teghra',
  'Barauni',
  'Bihat',
  'Bachhwara',
  'Bakhri',
  'Patna',
  'Samastipur',
  'Khagaria',
  'Lakhisarai',
  'Mokama',
  'Munger',
  'Darbhanga',
  'Muzaffarpur',
  'Hajipur',
  'Bhagalpur',
  'Nalanda',
  'Gaya',
  'Purnia',
] as const;

export const LOCAL_SEO_KEYWORDS = [
  // Core Wedding & Cinema Searches in Bihar
  'wedding shoot in Bihar',
  'wedding photography Begusarai',
  'best wedding photographer in Bihar',
  'cinematic wedding films Bihar',
  'shaadi photography Begusarai',
  'shaadi video shoot Bihar',
  'candid wedding photographer Begusarai',
  'wedding videographer near me Begusarai',
  'budget wedding photography Bihar',
  'drone wedding shoot Begusarai',
  // Reel Making & Short-Form Video Searches in Bihar
  'reel making in Bihar',
  'Instagram reel shoot Begusarai',
  'wedding reel maker Bihar',
  'shaadi reel shoot Begusarai',
  'reel videographer near me Bihar',
  'coaching centre reel shoot Bihar',
  'dukaan promotional reel shoot Begusarai',
  'business video shoot Bihar',
  'shop promo video maker Begusarai',
  // Pre-Wedding, Events & Short Films
  'pre-wedding shoot in Bihar',
  'pre-wedding photographer Begusarai',
  'engagement shoot Bihar',
  'birthday reel shoot Begusarai',
  'Chhath Puja reel shoot Bihar',
  'short film maker Bihar',
  '4K video editing studio Begusarai',
  // Hyper-Local Bihar Cities & Brand
  'Manish Cinematic',
  'ManishCinematic.in',
  'Manish Cinematic Begusarai',
  'Manish Cinematic Bihar',
  'Ayodhya Chowk Teghra photographer',
  'photographer in Teghra Begusarai',
  'photographer in Barauni',
  'wedding shoot Patna',
  'wedding shoot Samastipur',
  'wedding shoot Khagaria',
  'wedding shoot Darbhanga',
  'wedding shoot Lakhisarai',
  'wedding shoot Munger',
  'wedding shoot Muzaffarpur',
];

export const SITE_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Manish Cinematic – Wedding Shoot & Reel Maker in Bihar',
    template: '%s | Manish Cinematic Bihar',
  },
  description:
    'Book wedding photography, pre-wedding shoots, 4K cinema films, drone & Instagram reel making in Begusarai, Patna & across Bihar. Packages from ₹1,499.',
  applicationName: 'Manish Cinematic',
  authors: [{ name: 'Manish Cinematic', url: SITE_URL }],
  creator: 'Manish Cinematic',
  publisher: 'Manish Cinematic',
  category: 'Photography, Cinematography & Reel Production',
  alternates: {
    canonical: '/',
    languages: {
      'en-IN': '/',
      'hi-IN': '/',
      'x-default': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  keywords: LOCAL_SEO_KEYWORDS,
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Manish Cinematic',
    locale: 'en_IN',
    alternateLocale: ['hi_IN'],
    title: 'Manish Cinematic – Wedding Shoot & Reel Maker in Bihar',
    description:
      'Apne Sapnon Ki Shaadi, Bajat Mein. Cinematic wedding shoots, pre-wedding films, 4K drone & Instagram reels for families, shops & coaching centres across Bihar.',
    images: [
      {
        url: PRIMARY_OG_IMAGE,
        width: 1280,
        height: 720,
        alt: 'Manish Cinematic 4K Camera Rig & Wedding Film Editing Studio in Begusarai, Bihar',
      },
      {
        url: STUDIO_OG_IMAGE,
        width: 1200,
        height: 675,
        alt: 'Manish Cinematic Post-Production & Color Grading Suite, Teghra, Begusarai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manish Cinematic – Wedding Shoot & Reel Maker in Bihar',
    description:
      'Book wedding shoots, pre-wedding films, 4K drone & Instagram reel making across Begusarai, Patna, Samastipur & all Bihar. Packages starting ₹1,499.',
    images: [PRIMARY_OG_IMAGE],
  },
  other: {
    'geo.region': 'IN-BR',
    'geo.placename': 'Teghra, Begusarai, Bihar, India',
    'geo.position': '25.5035447;85.9278056',
    ICBM: '25.5035447, 85.9278056',
    distribution: 'local',
    coverage: 'Bihar, India',
    language: 'en-IN, hi-IN',
    rating: 'general',
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export function buildStructuredDataGraph() {
  const offerCatalogItems = [
    {
      name: 'Shubh Wedding Photography & Video Package',
      description:
        '1-day wedding shoot covering baraat, dwar puja, jaimala, pheras, sindoor daan & vidaai with 1 photographer, 1 videographer, 250 edited photos, 8-min highlight film & 1 reel.',
      price: '24999',
    },
    {
      name: 'Mangal 2-Day Cinematic Wedding Package',
      description:
        '2-day coverage for tilak/haldi & wedding day with 2 photographers, 1 videographer, 500 edited photos, 3-min teaser, 15-min cinematic film, 3 reels & 20-page album.',
      price: '54999',
    },
    {
      name: 'Rajwada 3-Day 4K Drone Wedding Cinema Package',
      description:
        '3-day coverage for tilak, haldi, sangeet, wedding & reception with 2 photographers, 2 videographers, 4K drone, 800+ photos, 25-min 4K film, 5 reels & 40-page premium album.',
      price: '109999',
    },
    {
      name: 'Shaadi Reel Pack (24-48 Hr Delivery)',
      description:
        '2–3 viral cinematic wedding reels shot on 4K gimbal with express 24–48 hour delivery across Bihar.',
      price: '3999',
    },
    {
      name: 'Dukaan Reel Pack (Shop & Business Video Shoot)',
      description:
        '3 promotional Instagram & Facebook reels for local shops, salons, jewellers & restaurants in Bihar.',
      price: '2999',
    },
    {
      name: 'Coaching Centre Reel Pack',
      description:
        '3 teacher intro, classroom & topper result reels with wireless mic audio for coaching institutes in Bihar.',
      price: '3499',
    },
    {
      name: 'Pre-Wedding Reel Shoot',
      description: '1 cinematic romantic pre-wedding reel + 20 retouched couple photos in Bihar.',
      price: '5999',
    },
    {
      name: 'Pre-Wedding Plus Shoot',
      description: '1 cinematic reel + 50 edited photos with 2 outfit changes & golden-hour direction.',
      price: '11999',
    },
    {
      name: 'Pre-Wedding Royal Drone Shoot',
      description: '2 cinematic reels + 80 edited photos + 4K aerial drone coverage + 3 outfit changes.',
      price: '19999',
    },
    {
      name: 'Chhath / Festival Special Reel',
      description: '1 soulful festival reel for Chhath Puja, Durga Puja, Holi & Diwali celebrations in Bihar.',
      price: '1999',
    },
    {
      name: 'Birthday / Engagement Reel Shoot',
      description: '1 celebration highlight reel for birthday parties or ring ceremonies delivered in 48 hours.',
      price: '1499',
    },
    {
      name: 'Monthly Brand Growth Reel & Photo Retainer',
      description: '8 monthly 4K reels + 25 business/campus photos + 1 festival special reel for Bihar brands.',
      price: '9999',
    },
  ];

  const faqEntries = [
    {
      question: 'How to book a wedding shoot or reel making session with Manish Cinematic in Bihar?',
      answer:
        'Click "WhatsApp Par Book Karein" on any package or tap "Check Date Availability". Share your event date and venue in Begusarai or anywhere in Bihar, pay a small advance via UPI or bank transfer (starting at ₹2,000 to lock your date or 30% booking amount), and receive instant booking confirmation.',
    },
    {
      question: 'What if the wedding or shoot date changes?',
      answer:
        'Inform us at least 10 days before your event and we transfer 100% of your advance to the new date at zero extra charge, subject to date availability.',
    },
    {
      question: 'Do you travel to other districts in Bihar for wedding shoots and reels?',
      answer:
        'Yes. We are based in Ayodhya Chowk, Teghra, Begusarai and regularly cover weddings, pre-wedding shoots, coaching reels, and business shoots across Barauni, Bihat, Samastipur, Khagaria, Lakhisarai, Mokama, Munger, Patna, Darbhanga, Muzaffarpur, Hajipur, Bhagalpur, and all Bihar districts.',
    },
    {
      question: 'How many edit rounds are included in wedding films and reels?',
      answer:
        'Every wedding film and reel package includes 2 complimentary revision rounds for music adjustments, clip swaps, or family highlights.',
    },
    {
      question: 'How long does photo, wedding film, and reel delivery take?',
      answer:
        'Shaadi Reels are delivered in 24–48 hours. Shubh wedding package is delivered in 20 days, Mangal in 25 days, and Rajwada 4K film with luxury album in 30 days, backed by our Delivery on time or ₹1,000 OFF promise.',
    },
    {
      question: 'Is the booking advance refundable?',
      answer:
        'Because we block our full cinema crew for your booked date, the advance is non-refundable on cancellation, but it is 100% adjustable toward a rescheduled date or another family function within 6 months.',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND_NAME,
        alternateName: [
          DOMAIN_DISPLAY,
          'Manish Cinematic Begusarai',
          'Manish Cinematic Bihar',
          'manishcinematic video and photo photographer',
        ],
        description:
          'Wedding photography, pre-wedding shoots, 4K cinematic wedding films, drone videography, and Instagram reel making for families, shops & coaching centres across Bihar.',
        inLanguage: ['en-IN', 'hi-IN'],
        publisher: {
          '@id': `${SITE_URL}/#localbusiness`,
        },
      },
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': `${SITE_URL}/#localbusiness`,
        name: BRAND_NAME,
        alternateName: [DOMAIN_DISPLAY, 'manishcinematic video and photo photographer'],
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icon-512.png`,
          width: 512,
          height: 512,
        },
        image: [
          `${SITE_URL}${PRIMARY_OG_IMAGE}`,
          `${SITE_URL}${STUDIO_OG_IMAGE}`,
          `${SITE_URL}/assets/aistudio/2026-11-19_14.43.55_0be1e108.jpg`,
          `${SITE_URL}/assets/aistudio/2026-11-19_14.57.32_3f4f843c.jpg`,
        ],
        description:
          'Short Film Maker, Wedding Photographer & Reel Creator in Teghra, Begusarai, Bihar. Offering affordable 4K wedding shoots, shaadi reels, pre-wedding shoots, drone videography, and promotional reels for local businesses & coaching centres across Bihar.',
        slogan: 'Dream • Shoot • Create — Apne Sapnon Ki Shaadi, Bajat Mein',
        email: 'manishcinematic821005@gmail.com',
        priceRange: '₹1,499 - ₹1,39,999',
        currenciesAccepted: 'INR',
        paymentAccepted: 'UPI, Bank Transfer, Cash, Google Pay, PhonePe, Paytm',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Ayodhya Chowk Teghra',
          addressLocality: 'Begusarai',
          addressRegion: 'Bihar',
          postalCode: '851133',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 25.5035447,
          longitude: 85.9278056,
        },
        serviceArea: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 25.5035447,
            longitude: 85.9278056,
          },
          geoRadius: 250000,
        },
        areaServed: [
          ...BIHAR_SERVICE_CITIES.map((city) => ({
            '@type': 'City',
            name: city,
            containedInPlace: {
              '@type': 'AdministrativeArea',
              name: 'Bihar',
            },
          })),
          {
            '@type': 'AdministrativeArea',
            name: 'Bihar',
          },
        ],
        knowsAbout: [
          'Wedding Photography',
          'Cinematic Wedding Films',
          'Instagram Reel Making',
          'Shaadi Reels',
          'Pre-Wedding Shoots',
          '4K Aerial Drone Videography',
          'Coaching Centre Promotional Reels',
          'Local Shop & Business Video Shoots',
          'Short Film Making',
          'Festival & Birthday Video Shoots',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Wedding Shoot, Reel Making & Pre-Wedding Packages in Bihar',
          itemListElement: offerCatalogItems.map((pkg) => ({
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: pkg.price,
            availability: 'https://schema.org/InStock',
            areaServed: 'Bihar, India',
            itemOffered: {
              '@type': 'Service',
              name: pkg.name,
              description: pkg.description,
              provider: {
                '@id': `${SITE_URL}/#localbusiness`,
              },
            },
          })),
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '10',
          bestRating: '5',
          worstRating: '1',
        },
        hasMap: GOOGLE_MAPS_URL,
        sameAs: [
          'https://youtube.com/@biharmanishcinematic?si=9g4A5srHKq-bBkTA',
          'https://www.instagram.com/manish___cinematic?utm_source=qr&gwpx=bG9nemV3bGgyZGJm',
          'https://www.facebook.com/share/1FnsmZuGuc/',
          GOOGLE_MAPS_URL,
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '09:00',
            closes: '21:00',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: faqEntries.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Manish Cinematic Bihar',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Wedding & Reel Packages',
            item: `${SITE_URL}/#packages`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Visual Gallery',
            item: `${SITE_URL}/#gallery`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Book a Shoot',
            item: `${SITE_URL}/#booking`,
          },
        ],
      },
    ],
  };
}
