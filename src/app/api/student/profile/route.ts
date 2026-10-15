import { NextResponse } from 'next/server';
import { getStudentProfile } from '@/lib/sp-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || undefined;

    const student = await getStudentProfile(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch student profile.' },
      { status: 500 }
    );
  }
}
