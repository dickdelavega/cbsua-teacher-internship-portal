import { NextResponse } from 'next/server';
import { getEnrolledStudents, enrollStudent } from '@/lib/sp-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const spIdentifier = searchParams.get('email') || searchParams.get('spId') || searchParams.get('id') || undefined;
    const students = await getEnrolledStudents(spIdentifier);
    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, username, name, program, temporaryPassword, ctId, spId } = body;

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
      spId: spId || null,
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
