import type { Metadata, Viewport } from 'next';
import { Poppins, Inter, Montserrat, Dancing_Script } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/src/context/AuthContext';
import { SITE_METADATA, buildStructuredDataGraph } from '@/src/lib/seoConfig';

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
