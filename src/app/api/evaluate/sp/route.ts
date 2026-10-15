import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profName, program, responses, comments } = body;

    const student = await prisma.student.upsert({
      where: { studentId: '2021-0001' },
      update: {},
      create: {
        studentId: '2021-0001',
        name: 'John Doe',
        program: 'BSED',
        password: 'hashedpassword123'
      }
    });

    const evaluation = await prisma.evaluationSP.create({
      data: {
        studentId: student.id,
        profName,
        program,
        responses,
        comments
      }
    });

    return NextResponse.json({ success: true, data: evaluation }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting SP evaluation:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit evaluation' }, { status: 500 });
  }
}
