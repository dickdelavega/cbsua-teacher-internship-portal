import { NextResponse } from 'next/server';
import { getCooperatingTeachers, addCooperatingTeacher } from '@/lib/sp-service';

export async function GET() {
  try {
    const teachers = await getCooperatingTeachers();
    return NextResponse.json({ success: true, data: teachers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, school, gradeLevel } = body;

    if (!name || !school || !gradeLevel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cooperating Teacher requires full name, school, and grade level.',
        },
        { status: 400 }
      );
    }

    const teacher = await addCooperatingTeacher({
      name: name.trim(),
      school: school.trim(),
      gradeLevel: gradeLevel.trim(),
    });

    return NextResponse.json({ success: true, data: teacher }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
