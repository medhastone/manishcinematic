import { NextResponse } from 'next/server';
import { getCatalogData } from '@/src/db/queries.ts';

export async function GET() {
  try {
    const data = await getCatalogData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to load catalog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load catalog data' },
      { status: 500 }
    );
  }
}
