import { NextResponse } from 'next/server';

const FREE_STUDIO_MAP_EMBED_URL =
  'https://maps.google.com/maps?q=25.5035447,85.9278056&t=&z=16&ie=UTF8&iwloc=&output=embed';

export async function GET() {
  return NextResponse.json({
    embedUrl: FREE_STUDIO_MAP_EMBED_URL,
    mode: 'free_embed',
  });
}
