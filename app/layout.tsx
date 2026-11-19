import type { Metadata } from 'next';
import { Poppins, Montserrat, Dancing_Script } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/src/context/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
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

export const metadata: Metadata = {
  title: 'Manish Cinematic — Wedding Photography & Cinematography Studio in Begusarai, Bihar',
  description:
    'Manish Cinematic (Short Film Maker | Cinematographer) in Ayodhya Chowk Tegra, Begusarai, Bihar. Wedding photography, pre-wedding shoots, cinematic wedding films & short films starting ₹15,000/-.',
  keywords: [
    'Manish Cinematic',
    'Wedding Photography Begusarai',
    'Cinematographer Begusarai Bihar',
    'Pre-Wedding Shoot Begusarai',
    'Ayodhya Chowk Tegra Photography Studio',
    'Short Film Maker Bihar',
  ],
  openGraph: {
    title: 'Manish Cinematic — Capture Your Best Moment | Begusarai, Bihar',
    description:
      'Dream • Shoot • Create. Premium wedding photography, cinematic wedding films, pre-wedding shoots, drone videography & short films in Begusarai, Bihar.',
    type: 'website',
    siteName: 'Manish Cinematic',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manish Cinematic — Wedding Photography & Cinematography in Begusarai',
    description:
      'Capture Your Best Moment with Manish Cinematic, Ayodhya Chowk Tegra, Begusarai. Packages starting ₹15,000/-.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://manishcinematic.in/#localbusiness',
    name: 'Manish Cinematic',
    alternateName: 'Manish Cinematic Wedding Photography & Cinematography',
    description:
      'Short Film Maker | Cinematographer — Dream • Shoot • Create. Luxury wedding photography, pre-wedding shoots, cinematic wedding films, drone videography, and short films in Begusarai, Bihar.',
    email: 'manishcinematic821005@gmail.com',
    priceRange: '₹15,000 - ₹2,50,000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ayodhya Chowk Tegra',
      addressLocality: 'Begusarai',
      addressRegion: 'Bihar',
      postalCode: '851133',
      addressCountry: 'IN',
    },
    areaServed: ['Begusarai', 'Teghra', 'Barauni', 'Patna', 'Samastipur', 'Bihar'],
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
  };

  return (
    <html
      lang="en"
      className={`dark ${poppins.variable} ${montserrat.variable} ${dancingScript.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#0a0a0a] text-white antialiased selection:bg-[#e10600] selection:text-white"
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
