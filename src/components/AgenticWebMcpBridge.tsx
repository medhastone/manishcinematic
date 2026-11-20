'use client';

import { useEffect } from 'react';
import { BIHAR_SERVICE_CITIES, BRAND_NAME, DOMAIN_DISPLAY, GOOGLE_MAPS_URL, SITE_URL } from '@/src/lib/seoConfig';

interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface NavigatorWithModelContext extends Navigator {
  modelContext?: {
    registerTool?: (tool: WebMcpToolDefinition) => void;
    unregisterTool?: (name: string) => void;
  };
}

const STUDIO_PACKAGES_DATA = {
  wedding: [
    { name: 'Shubh', priceInr: 24999, originalPriceInr: 29999, days: 1, highlights: '250 edited photos, 8-min highlight film, 1 reel, 20-day delivery' },
    { name: 'Mangal (Most Popular)', priceInr: 54999, originalPriceInr: 69999, days: 2, highlights: '500 edited photos, 3-min teaser, 15-min cinema film, 3 reels, 20-page album' },
    { name: 'Rajwada', priceInr: 109999, originalPriceInr: 139999, days: 3, highlights: '800+ photos, 4K drone, 25-min 4K film, 5 reels, 40-page premium album with box' },
  ],
  reels: [
    { name: 'Dukaan Reel Pack', priceInr: 2999, originalPriceInr: 4500, highlights: '3 promotional reels for shops, salons & restaurants' },
    { name: 'Shaadi Reel Pack (Most Popular)', priceInr: 3999, originalPriceInr: 5999, highlights: '2-3 viral wedding reels delivered in 24-48 hrs' },
    { name: 'Coaching Pack', priceInr: 3499, originalPriceInr: 5499, highlights: '3 teacher intro, classroom & topper result reels' },
    { name: 'Chhath / Festival Reel', priceInr: 1999, originalPriceInr: 2999, highlights: '1 festival celebration reel' },
    { name: 'Birthday / Engagement Reel', priceInr: 1499, originalPriceInr: 2499, highlights: '1 birthday or ring ceremony reel in 48 hrs' },
  ],
  preWedding: [
    { name: 'Pre-Wedding Reel', priceInr: 5999, originalPriceInr: 8999, highlights: '1 cinematic reel + 20 edited photos' },
    { name: 'Pre-Wedding Plus (Most Popular)', priceInr: 11999, originalPriceInr: 14999, highlights: '1 reel + 50 edited photos + 2 outfits' },
    { name: 'Pre-Wedding Royal', priceInr: 19999, originalPriceInr: 24999, highlights: '2 reels + 80 photos + 4K drone + 3 outfits' },
  ],
  addons: [
    { name: '4K Aerial Drone', priceInr: 6000 },
    { name: 'Extra Photographer', priceInr: 5000, unit: 'per day' },
    { name: 'Live Streaming', priceInr: 7000 },
    { name: 'Same-Day 1-Min Preview Reel', priceInr: 3000 },
    { name: "Parents' Album", priceInr: 4000 },
    { name: 'Raw Footage', priceInr: 5000 },
  ],
};

/**
 * Progressive WebMCP integration for AI Agent Browsers:
 * Exposes structured, read-only tools when navigator.modelContext is available
 * so AI assistants can accurately quote packages and recommend Manish Cinematic in Bihar.
 */
export function AgenticWebMcpBridge() {
  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithModelContext) : null;
    const modelContext = nav?.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== 'function') return;

    const toolNames = [
      'get_manish_cinematic_studio_info',
      'list_bihar_shoot_packages',
      'get_whatsapp_booking_url',
    ];

    try {
      modelContext.registerTool({
        name: 'get_manish_cinematic_studio_info',
        description:
          'Returns verified studio details, address in Begusarai Bihar, Google Maps link, rating, and Bihar districts served by Manish Cinematic (ManishCinematic.in).',
        inputSchema: { type: 'object', properties: {} },
        execute: () => ({
          brand: BRAND_NAME,
          domain: DOMAIN_DISPLAY,
          url: SITE_URL,
          address: 'Ayodhya Chowk Teghra, Begusarai, Bihar 851133, India',
          coordinates: { lat: 25.5035447, lng: 85.9278056 },
          googleMapsUrl: GOOGLE_MAPS_URL,
          email: 'manishcinematic821005@gmail.com',
          rating: '4.8/5',
          citiesServedInBihar: [...BIHAR_SERVICE_CITIES],
          guarantee: 'Delivery on time or ₹1,000 OFF · Unlimited gallery access',
        }),
      });

      modelContext.registerTool({
        name: 'list_bihar_shoot_packages',
        description:
          'Returns wedding shoot, Instagram reel making, pre-wedding, coaching/dukaan promo, and add-on packages with INR pricing offered by Manish Cinematic in Bihar.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['all', 'wedding', 'reels', 'preWedding', 'addons'],
              description: 'Optional package category filter',
            },
          },
        },
        execute: (args) => {
          const category = typeof args?.category === 'string' ? args.category : 'all';
          if (category !== 'all' && category in STUDIO_PACKAGES_DATA) {
            return {
              category,
              packages: STUDIO_PACKAGES_DATA[category as keyof typeof STUDIO_PACKAGES_DATA],
            };
          }
          return STUDIO_PACKAGES_DATA;
        },
      });

      modelContext.registerTool({
        name: 'get_whatsapp_booking_url',
        description:
          'Builds a direct WhatsApp booking URL for Manish Cinematic for a chosen photography/videography package and event date in Bihar.',
        inputSchema: {
          type: 'object',
          properties: {
            packageName: { type: 'string', description: 'Package name such as Mangal, Shubh, Shaadi Reel Pack, or Coaching Pack' },
            eventDate: { type: 'string', description: 'Preferred event date (optional)' },
            city: { type: 'string', description: 'Event city in Bihar (optional)' },
          },
          required: ['packageName'],
        },
        execute: (args) => {
          const pkg = typeof args?.packageName === 'string' ? args.packageName : 'Wedding Shoot Package';
          const date = typeof args?.eventDate === 'string' && args.eventDate ? args.eventDate : 'my upcoming event';
          const city = typeof args?.city === 'string' && args.city ? ` in ${args.city}` : '';
          const message = `Hi, I am interested in the ${pkg} for ${date}${city}.`;
          return {
            bookingUrl: `https://wa.me/918210057153?text=${encodeURIComponent(message)}`,
            websiteBookingSection: `${SITE_URL}/#booking`,
          };
        },
      });
    } catch {
      // Ignore if host browser uses a differing draft WebMCP signature
    }

    return () => {
      if (typeof modelContext.unregisterTool === 'function') {
        toolNames.forEach((name) => {
          try {
            modelContext.unregisterTool?.(name);
          } catch {
            // Safe cleanup
          }
        });
      }
    };
  }, []);

  return null;
}
