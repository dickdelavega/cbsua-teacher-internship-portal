import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const db = prisma as any;

export async function GET() {
  try {
    // 0. Ensure tables exist if on PostgreSQL (e.g. Supabase, Neon, Vercel Postgres)
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
      try {
        await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Dean" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "title" TEXT NOT NULL DEFAULT 'Dean, College of Education',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "SupervisingProfessor" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "program" TEXT DEFAULT 'Bachelor of Secondary Education',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "CooperatingTeacher" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "school" TEXT NOT NULL,
          "gradeLevel" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "Student" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL UNIQUE,
          "username" TEXT UNIQUE,
          "name" TEXT NOT NULL,
          "program" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "spId" TEXT,
          "ctId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "EvaluationCT" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "teacherName" TEXT NOT NULL,
          "schoolName" TEXT NOT NULL,
          "responses" JSONB NOT NULL,
          "comments" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "EvaluationSP" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "profName" TEXT NOT NULL,
          "program" TEXT NOT NULL,
          "responses" JSONB NOT NULL,
          "comments" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "username" TEXT;
        ALTER TABLE "SupervisingProfessor" ADD COLUMN IF NOT EXISTS "program" TEXT DEFAULT 'Bachelor of Secondary Education';
        CREATE UNIQUE INDEX IF NOT EXISTS "Student_username_key" ON "Student"("username");
      `);
      } catch (ddlError) {
        console.warn('Note: Auto DDL skipped or not applicable:', ddlError);
      }
    }

    // 1. Dean of the College of Education
    const dean = await db.dean.upsert({
      where: { email: 'dean.education@cbsua.edu.ph' },
      update: {
        name: 'Dr. Raquel M. Reapor, Ed.D.',
        title: 'Dean, College of Education',
      },
      create: {
        name: 'Dr. Raquel M. Reapor, Ed.D.',
        email: 'dean.education@cbsua.edu.ph',
        password: 'password123',
        title: 'Dean, College of Education',
      },
    });

    // 2. Multiple Supervising Professors per Program
    const spList = [
      {
        name: 'Dr. Maria Elena Santos',
        email: 'mesantos@cbsua.edu.ph',
        password: 'password123',
        program: 'Bachelor of Secondary Education',
      },
      {
        name: 'Prof. Roberto C. Mendoza, MAEd',
        email: 'rmendoza@cbsua.edu.ph',
        password: 'password123',
        program: 'Bachelor of Secondary Education',
      },
      {
        name: 'Dr. Clarissa T. Ocampo',
        email: 'cocampo@cbsua.edu.ph',
        password: 'password123',
        program: 'Bachelor of Elementary Education',
      },
      {
        name: 'Engr. Danilo V. Bautista, Ed.D.',
        email: 'dbautista@cbsua.edu.ph',
        password: 'password123',
        program: 'Bachelor of Technology and Livelihood Education',
      },
    ];

    const seededSPs: any[] = [];
    for (const spItem of spList) {
      const sProf = await db.supervisingProfessor.upsert({
        where: { email: spItem.email },
        update: {
          name: spItem.name,
        },
        create: spItem,
      });
      seededSPs.push(sProf);
    }

    // 3. Cooperating Teachers
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
      const existing = await db.cooperatingTeacher.findFirst({
        where: { name: ct.name, school: ct.school },
      });
      if (!existing) {
        const created = await db.cooperatingTeacher.create({ data: ct });
        createdCTs.push(created);
      } else {
        createdCTs.push(existing);
      }
    }

    // 4. Students across the 3 Degree Programs
    const students = [
      // BSED
      {
        studentId: '2021-10492',
        username: 'jdelacruz',
        name: 'Juan Dela Cruz',
        program: 'Bachelor of Secondary Education',
        spId: seededSPs[0]?.id,
        ctId: createdCTs[0]?.id,
      },
      {
        studentId: '2021-10511',
        username: 'ksalazar',
        name: 'Kristine Mae Salazar',
        program: 'Bachelor of Secondary Education',
        spId: seededSPs[0]?.id,
        ctId: createdCTs[1]?.id,
      },
      {
        studentId: '2021-10988',
        username: 'pvelasco',
        name: 'Patricia Nicole Velasco',
        program: 'Bachelor of Secondary Education',
        spId: seededSPs[1]?.id,
        ctId: createdCTs[0]?.id,
      },
      // BEED
      {
        studentId: '2021-20114',
        username: 'mlramos',
        name: 'Maria Lourdes Ramos',
        program: 'Bachelor of Elementary Education',
        spId: seededSPs[2]?.id,
        ctId: createdCTs[2]?.id,
      },
      {
        studentId: '2021-20155',
        username: 'cpdiaz',
        name: 'Christian Paul Diaz',
        program: 'Bachelor of Elementary Education',
        spId: seededSPs[2]?.id,
        ctId: createdCTs[2]?.id,
      },
      // BTLEd
      {
        studentId: '2021-10678',
        username: 'abautista',
        name: 'Alvin Mark Bautista',
        program: 'Bachelor of Technology and Livelihood Education',
        spId: seededSPs[3]?.id,
        ctId: createdCTs[3]?.id,
      },
      {
        studentId: '2021-30882',
        username: 'mareyes',
        name: 'Mark Anthony Reyes',
        program: 'Bachelor of Technology and Livelihood Education',
        spId: seededSPs[3]?.id,
        ctId: createdCTs[3]?.id,
      },
    ];

    const seededStudents = [];
    for (const st of students) {
      const s = await db.student.upsert({
        where: { studentId: st.studentId },
        update: {}, // Non-destructive: preserve existing assignments and user edits
        create: {
          ...st,
          password: 'password123',
        },
      });
      seededStudents.push(s);
    }

    return NextResponse.json({
      success: true,
      message: 'CBSUA Database initialized & seeded successfully with Dean, Multiple SPs per Program, and Student Interns!',
      data: {
        dean: {
          name: dean.name,
          email: dean.email,
          title: dean.title,
        },
        supervisingProfessorsCount: seededSPs.length,
        supervisingProfessors: seededSPs.map((p) => ({
          name: p.name,
          email: p.email,
          program: p.program,
        })),
        cooperatingTeachersCount: createdCTs.length,
        studentsCount: seededStudents.length,
        programsCovered: [
          'Bachelor of Secondary Education',
          'Bachelor of Elementary Education',
          'Bachelor of Technology and Livelihood Education',
        ],
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to seed database';
    console.error('Seed API error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
