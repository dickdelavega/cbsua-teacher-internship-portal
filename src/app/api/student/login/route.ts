import { NextResponse } from 'next/server';
import { verifyStudentLogin } from '@/lib/sp-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;
    const identifier = body.identifier || body.studentId || body.username;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter your Username/Student ID and Password.' },
        { status: 400 }
      );
    }

    const student = await verifyStudentLogin(identifier, password);
    return NextResponse.json({
      success: true,
      message: 'Student login successful!',
      data: student,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Invalid credentials.';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 401 }
    );
  }
}
