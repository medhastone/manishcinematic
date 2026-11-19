import { NextRequest, NextResponse } from 'next/server';
import { createPublicReview, getPublicReviews } from '@/src/db/queries.ts';

export async function GET() {
  try {
    const reviews = await getPublicReviews();
    return NextResponse.json({ reviews });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load client reviews';
    console.error('GET /api/reviews error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientName = typeof body.clientName === 'string' ? body.clientName.trim() : '';
    const address = typeof body.address === 'string' ? body.address.trim() : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
    const shootType = typeof body.shootType === 'string' ? body.shootType.trim() : 'Client Review';
    const rawRating = Number(body.rating);

    if (clientName.length < 2 || clientName.length > 80) {
      return NextResponse.json(
        { error: 'Please enter your name (between 2 and 80 characters).' },
        { status: 400 }
      );
    }

    if (address.length < 2 || address.length > 120) {
      return NextResponse.json(
        { error: 'Please enter your address or city (between 2 and 120 characters).' },
        { status: 400 }
      );
    }

    if (comment.length < 5 || comment.length > 600) {
      return NextResponse.json(
        { error: 'Please write a comment between 5 and 600 characters.' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rawRating) || rawRating < 1 || rawRating > 5) {
      return NextResponse.json(
        { error: 'Please select a star rating from 1 to 5.' },
        { status: 400 }
      );
    }

    const review = await createPublicReview({
      clientName,
      eventLocation: address,
      quote: comment,
      rating: rawRating,
      clientRole: shootType.slice(0, 60) || 'Client Review',
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit your review';
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
