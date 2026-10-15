import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Supervising Professor
    const sp = await prisma.supervisingProfessor.upsert({
      where: { email: 'mesantos@cbsua.edu.ph' },
      update: {},
      create: {
        name: 'Dr. Maria Elena Santos',
        email: 'mesantos@cbsua.edu.ph',
        password: 'password123',
      },
    });

    // 2. Cooperating Teachers
    const ctData = [
      {
        name: 'Mrs. Rochelle B. Alvarez, LPT',
        school: 'Pili National High School',
        gradeLevel: 'Grade 10 - English & Literature',
      },
      {
        name: 'Mr. Ferdinand G. Ramos, LPT',
        school: 'Camarines Sur National High School',
        gradeLevel: 'Grade 9 - Mathematics',
      },
      {
        name: 'Ms. Jocelyn P. De Leon, LPT',
        school: 'San Jose Integrated School',
        gradeLevel: 'Grade 7 - Science & Technology',
      },
      {
        name: 'Engr. Antonio M. Reyes, LPT',
        school: 'CBSUA Laboratory High School',
        gradeLevel: 'Grade 8 - Technology and Livelihood Education',
      },
    ];

    const createdCTs = [];
    for (const ct of ctData) {
      const existing = await prisma.cooperatingTeacher.findFirst({
        where: { name: ct.name, school: ct.school },
      });
      if (!existing) {
        const created = await prisma.cooperatingTeacher.create({ data: ct });
        createdCTs.push(created);
      } else {
        createdCTs.push(existing);
      }
    }

    // 3. Students
    const students = [
      {
        studentId: '2021-10492',
        name: 'Juan Dela Cruz',
        program: 'BSED - Major in English',
        spId: sp.id,
        ctId: createdCTs[0]?.id,
      },
      {
        studentId: '2021-10511',
        name: 'Kristine Mae Salazar',
        program: 'BSED - Major in Mathematics',
        spId: sp.id,
        ctId: createdCTs[1]?.id,
      },
      {
        studentId: '2021-10678',
        name: 'Alvin Mark Bautista',
        program: 'BSED - Major in General Science',
        spId: sp.id,
        ctId: createdCTs[2]?.id,
      },
      {
        studentId: '2021-10988',
        name: 'Patricia Nicole Velasco',
        program: 'BSED - Major in English',
        spId: sp.id,
        ctId: createdCTs[3]?.id,
      },
    ];

    const seededStudents = [];
    for (const st of students) {
      const s = await prisma.student.upsert({
        where: { studentId: st.studentId },
        update: { ctId: st.ctId, spId: st.spId },
        create: {
          ...st,
          password: 'password123',
        },
      });
      seededStudents.push(s);
    }

    return NextResponse.json({
      success: true,
      message: 'CBSUA Database initialized & seeded successfully on Vercel!',
      data: {
        supervisingProfessor: sp.name,
        cooperatingTeachersCount: createdCTs.length,
        studentsCount: seededStudents.length,
        students: seededStudents.map((s) => ({
          studentId: s.studentId,
          name: s.name,
        })),
      },
    });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}
