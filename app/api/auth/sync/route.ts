import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/src/lib/firebase-admin.ts';
import { getOrCreateUser, updateUserProfile } from '@/src/db/queries.ts';

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyBearerToken(req.headers.get('authorization'));
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const userRecord = await getOrCreateUser(
      decoded.uid,
      decoded.email || body.email || 'client@lumiereatelier.in',
      decoded.name || body.name,
      body.phone
    );

    return NextResponse.json({ user: userRecord });
  } catch (error: any) {
    console.error('Auth sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to synchronize user profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const decoded = await verifyBearerToken(req.headers.get('authorization'));
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateUserProfile(decoded.uid, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
