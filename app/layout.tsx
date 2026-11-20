import type { Metadata, Viewport } from 'next';
import { Poppins, Inter, Montserrat, Dancing_Script } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/src/context/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-script',
});

const SITE_URL = (process.env.APP_URL || 'https://manishcinematic.in').replace(/\/+$/, '');
const OG_IMAGE_PATH = '/assets/aistudio/2026-11-19_14.43.52_c4eb0004.jpg';

export const viewport: Viewport = {
  themeColor: '#3E0815',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Manish Cinematic — Wedding Photography & Films, Begusarai',
  description:
    'Book Manish Cinematic in Teghra, Begusarai, Bihar for wedding photography, pre-wedding shoots, 4K cinema films, drone coverage & short films from ₹15,000/-.',
  applicationName: 'Manish Cinematic',
  authors: [{ name: 'Manish Cinematic', url: SITE_URL }],
  creator: 'Manish Cinematic',
  publisher: 'Manish Cinematic',
  category: 'Photography & Cinematography',
  alternates: {
    canonical: '/',
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
  keywords: [
    'Manish Cinematic',
    'Manish Cinematic Begusarai',
    'Wedding Photography Begusarai',
    'Cinematographer Begusarai Bihar',
    'Pre-Wedding Shoot Begusarai',
    'Ayodhya Chowk Teghra Photography Studio',
    'Wedding Videography Bihar',
    'Drone Wedding Shoot Begusarai',
    'Short Film Maker Bihar',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Manish Cinematic',
    locale: 'en_IN',
    title: 'Manish Cinematic — Wedding Photography & Films, Begusarai',
    description:
      'Dream • Shoot • Create. Wedding photography, pre-wedding shoots, 4K cinematic wedding films, drone videography & short films in Begusarai, Bihar.',
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 675,
        alt: 'Manish Cinematic 4K Editing & Cinematography Studio in Begusarai, Bihar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manish Cinematic — Wedding Photography & Films, Begusarai',
    description:
      'Capture Your Best Moment with Manish Cinematic, Ayodhya Chowk Teghra, Begusarai. Packages starting ₹15,000/-.',
    images: [OG_IMAGE_PATH],
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Manish Cinematic',
        alternateName: 'Manish Cinematic Begusarai',
        description:
          'Wedding photography, pre-wedding shoots, 4K cinematic wedding films, drone videography & short films in Begusarai, Bihar.',
        inLanguage: 'en-IN',
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#localbusiness`,
        name: 'Manish Cinematic',
        alternateName: 'manishcinematic video and photo photographer',
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        image: [
          `${SITE_URL}${OG_IMAGE_PATH}`,
          `${SITE_URL}/assets/aistudio/2026-11-19_14.43.55_0be1e108.jpg`,
          `${SITE_URL}/assets/aistudio/2026-11-19_14.57.32_3f4f843c.jpg`,
        ],
        description:
          'Short Film Maker | Cinematographer — Dream • Shoot • Create. Wedding photography, pre-wedding shoots, cinematic wedding films, drone videography, and short films in Teghra, Begusarai, Bihar.',
        email: 'manishcinematic821005@gmail.com',
        priceRange: '₹15,000 - ₹2,50,000',
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
        areaServed: [
          'Begusarai',
          'Teghra',
          'Barauni',
          'Bihat',
          'Patna',
          'Samastipur',
          'Khagaria',
          'Lakhisarai',
          'Darbhanga',
          'Bihar',
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '10',
          bestRating: '5',
          worstRating: '1',
        },
        hasMap:
          'https://www.google.com/maps/place/manishcinematic+video+and+photo+photographer/@25.5035447,85.9252307,1419m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39f273aa7eaa3209:0x130f2bb553405f7!8m2!3d25.5035447!4d85.9278056!16s%2Fg%2F11zkvwx_91?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MTExNi4wIKXMDSoASAFQAw%3D%3D',
        sameAs: [
          'https://youtube.com/@biharmanishcinematic?si=9g4A5srHKq-bBkTA',
          'https://www.instagram.com/manish___cinematic?utm_source=qr&gwpx=bG9nemV3bGgyZGJm',
          'https://www.facebook.com/share/1FnsmZuGuc/',
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
    ],
  };

  return (
    <html
      lang="en"
      className={`dark ${poppins.variable} ${inter.variable} ${montserrat.variable} ${dancingScript.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#3E0815] text-white antialiased selection:bg-[#D4AF37] selection:text-[#2B060F]"
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
