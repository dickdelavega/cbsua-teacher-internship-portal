import { NextResponse } from 'next/server';
import { getDeanProfile } from '@/lib/dean-service';

export async function GET() {
  try {
    const dean = await getDeanProfile();
    return NextResponse.json({ success: true, data: dean });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch Dean profile.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
