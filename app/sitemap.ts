import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.APP_URL || 'https://manishcinematic.in').replace(/\/+$/, '');
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [
        `${baseUrl}/assets/cinema_hero_backdrop_1795170914610.jpg`,
        `${baseUrl}/assets/aistudio/2026-11-19_14.43.52_c4eb0004.jpg`,
        `${baseUrl}/assets/aistudio/2026-11-19_13.45.16_856a87fb.jpg`,
        `${baseUrl}/assets/aistudio/2026-11-19_13.44.44_328bb63e.jpg`,
        `${baseUrl}/assets/aistudio/2026-11-19_14.57.32_3f4f843c.jpg`,
      ],
    },
  ];
}
