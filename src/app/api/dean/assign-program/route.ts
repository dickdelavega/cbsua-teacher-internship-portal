import { NextResponse } from 'next/server';
import { assignSupervisingProfessorProgram } from '@/lib/dean-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { professorId, program } = body;

    if (!professorId || !program) {
      return NextResponse.json(
        { success: false, error: 'Professor ID and Target Program are required.' },
        { status: 400 }
      );
    }

    const result = await assignSupervisingProfessorProgram(professorId, program);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.professor,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to assign program.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
