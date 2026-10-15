import { NextResponse } from 'next/server';
import { assignStudentToCooperatingTeacher } from '@/lib/sp-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, ctId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required.' },
        { status: 400 }
      );
    }

    const updated = await assignStudentToCooperatingTeacher(studentId, ctId || null);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
