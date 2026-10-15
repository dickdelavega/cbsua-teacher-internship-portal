import { NextResponse } from 'next/server';
import { verifyStudentLogin } from '@/lib/sp-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Invalid credentials.' },
      { status: 401 }
    );
  }
}
