import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/src/lib/firebase-admin.ts';
import {
  getOrCreateUser,
  getAdminDashboardData,
  adminUpdateBooking,
  adminUpsertPackage,
  adminUpsertAvailability,
  adminCreatePortfolioItem,
  adminDeletePortfolioItem,
  adminCreateTestimonial,
} from '@/src/db/queries.ts';

async function verifyAdminAccess(req: NextRequest) {
  const decoded = await verifyBearerToken(req.headers.get('authorization'));
  if (!decoded) return null;
  const user = await getOrCreateUser(decoded.uid, decoded.email || 'admin@lumiereatelier.in');
  if (user.role !== 'admin') return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdminAccess(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden: Studio Administrator permissions required.' },
        { status: 403 }
      );
    }

    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load admin dashboard data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await verifyAdminAccess(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden: Studio Administrator permissions required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, payload } = body;

    if (action === 'update_booking') {
      const updated = await adminUpdateBooking(Number(payload.bookingId), payload.updates);
      return NextResponse.json({ booking: updated });
    }

    if (action === 'upsert_package') {
      const saved = await adminUpsertPackage(payload);
      return NextResponse.json({ package: saved });
    }

    if (action === 'upsert_availability') {
      const saved = await adminUpsertAvailability(payload);
      return NextResponse.json({ slot: saved });
    }

    if (action === 'create_portfolio') {
      const saved = await adminCreatePortfolioItem(payload);
      return NextResponse.json({ item: saved });
    }

    if (action === 'delete_portfolio') {
      await adminDeletePortfolioItem(Number(payload.id));
      return NextResponse.json({ deleted: true });
    }

    if (action === 'create_testimonial') {
      const saved = await adminCreateTestimonial(payload);
      return NextResponse.json({ testimonial: saved });
    }

    return NextResponse.json({ error: 'Unknown admin action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Admin operation failed' },
      { status: 500 }
    );
  }
}
