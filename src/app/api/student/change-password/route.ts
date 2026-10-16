import { NextResponse } from 'next/server';
import { changeStudentPassword } from '@/lib/sp-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const studentId = body.studentId || body.studentIdentifier;
    const { currentPassword, newPassword } = body;

    if (!studentId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const result = await changeStudentPassword(studentId, currentPassword, newPassword);
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update password.';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 400 }
    );
  }
}
