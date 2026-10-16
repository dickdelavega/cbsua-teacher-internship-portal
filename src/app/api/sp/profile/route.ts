import { NextResponse } from 'next/server';
import { getSupervisingProfessor } from '@/lib/sp-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('email') || searchParams.get('spId') || searchParams.get('id') || undefined;
    const profile = await getSupervisingProfessor(identifier);
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
