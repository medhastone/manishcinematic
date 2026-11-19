import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    '';

  const query = encodeURIComponent(
    'manishcinematic video and photo photographer, 25.5035447,85.9278056'
  );

  if (apiKey) {
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
      apiKey
    )}&q=${query}&zoom=16&language=en&region=IN&solution_id=gmp_mcp_codeassist_v1_aistudio`;

    return NextResponse.json({
      embedUrl,
      mode: 'gmp_embed_v1',
    });
  }

  // Fallback iframe URL if key is not injected in a local dev environment
  const fallbackUrl = `https://maps.google.com/maps?q=25.5035447,85.9278056&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  return NextResponse.json({
    embedUrl: fallbackUrl,
    mode: 'fallback',
  });
}
