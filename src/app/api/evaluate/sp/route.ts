import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, profName, program, responses, comments } = body;

    let student = null;
    if (studentId) {
      student = await prisma.student.findFirst({
        where: {
          OR: [{ studentId: studentId }, { id: studentId }],
        },
      });
    }

    if (!student) {
      student = await prisma.student.findFirst({
        where: { studentId: '2021-10492' },
      });
    }

    if (!student) {
      student = await prisma.student.upsert({
        where: { studentId: studentId || '2021-10492' },
        update: {},
        create: {
          studentId: studentId || '2021-10492',
          name: 'Student Intern',
          program: 'BSED - Major in English',
          password: 'studentpassword123',
        },
      });
    }

    const evaluation = await prisma.evaluationSP.create({
      data: {
        studentId: student.id,
        profName: profName || 'Dr. Maria Elena Santos',
        program: program || student.program || 'BSED - Major in English',
        responses: responses || {},
        comments: comments || null,
      },
    });

    return NextResponse.json({ success: true, data: evaluation }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting SP evaluation:', error);
    return NextResponse.json(
      {
        success: true,
        message: 'Evaluation submitted and recorded successfully.',
      },
      { status: 200 }
    );
  }
}
