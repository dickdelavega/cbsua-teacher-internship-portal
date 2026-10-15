import { NextResponse } from 'next/server';
import { resetStudentPassword } from '@/lib/sp-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const studentId = body.studentId || body.studentIdentifier;
    const { newPassword } = body;

    if (!studentId || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Student ID and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const result = await resetStudentPassword(studentId, newPassword);
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update student password.' },
      { status: 400 }
    );
  }
}
