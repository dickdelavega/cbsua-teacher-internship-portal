import { NextResponse } from 'next/server';
import { getDeanCollegeOverview } from '@/lib/dean-service';

export async function GET() {
  try {
    const stats = await getDeanCollegeOverview();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch college stats.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
