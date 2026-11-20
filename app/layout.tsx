import type { Metadata, Viewport } from 'next';
import { Poppins, Inter, Montserrat, Dancing_Script } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/src/context/AuthContext';
import { AgenticWebMcpBridge } from '@/src/components/AgenticWebMcpBridge';
import { SITE_METADATA, buildStructuredDataGraph } from '@/src/lib/seoConfig';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  preload: false,
  variable: '--font-script',
});

export const viewport: Viewport = {
  themeColor: '#3E0815',
  colorScheme: 'dark',
};

export const metadata: Metadata = SITE_METADATA;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = buildStructuredDataGraph();

  return (
    <html
      lang="en-IN"
      className={`dark ${poppins.variable} ${inter.variable} ${montserrat.variable} ${dancingScript.variable}`}
    >
      <head>
        {/* Early LCP image discovery for fast mobile & desktop First/Largest Contentful Paint */}
        <link
          rel="preload"
          as="image"
          href="/assets/opt/cinema_hero_backdrop_sm.webp"
          media="(max-width: 767px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/opt/cinema_hero_backdrop.webp"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/opt/aistudio/2026-11-19_14.43.52_c4eb0004.webp"
          fetchPriority="high"
        />
        {/* Machine-readable AI Agent discovery document */}
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="Manish Cinematic Bihar — AI Agent Studio Summary"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#3E0815] text-white antialiased selection:bg-[#D4AF37] selection:text-[#2B060F]"
      >
        <AuthProvider>
          <AgenticWebMcpBridge />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
