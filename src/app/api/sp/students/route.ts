import { NextResponse } from 'next/server';
import { getEnrolledStudents, enrollStudent } from '@/lib/sp-service';

export async function GET() {
  try {
    const students = await getEnrolledStudents();
    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, username, name, program, temporaryPassword, ctId } = body;

    if (!studentId || !name || !program) {
      return NextResponse.json(
        { success: false, error: 'Student ID, Name, and Program are required.' },
        { status: 400 }
      );
    }

    const student = await enrollStudent({
      studentId: studentId.trim(),
      username: username?.trim() || null,
      name: name.trim(),
      program: program.trim(),
      temporaryPassword: temporaryPassword?.trim() || null,
      ctId: ctId || null,
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
