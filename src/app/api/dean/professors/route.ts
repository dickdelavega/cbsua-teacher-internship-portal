import { NextResponse } from 'next/server';
import {
  getDeanSupervisingProfessors,
  createSupervisingProfessorByDean,
} from '@/lib/dean-service';

export async function GET() {
  try {
    const professors = await getDeanSupervisingProfessors();
    return NextResponse.json({ success: true, data: professors });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch supervising professors.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, program, temporaryPassword } = body;

    if (!name || !email || !program) {
      return NextResponse.json(
        { success: false, error: 'Professor name, email, and program are required.' },
        { status: 400 }
      );
    }

    const created = await createSupervisingProfessorByDean({
      name,
      email,
      program,
      temporaryPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'Supervising Professor appointed and program assigned successfully.',
      data: created,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create supervising professor.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
