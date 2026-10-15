import { NextResponse } from 'next/server';
import { getSupervisingProfessor } from '@/lib/sp-service';

export async function GET() {
  try {
    const profile = await getSupervisingProfessor();
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
