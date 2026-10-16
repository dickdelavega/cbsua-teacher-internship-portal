import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 0. Ensure tables exist if on PostgreSQL (e.g. Supabase, Neon, Vercel Postgres)
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SupervisingProfessor" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "password" TEXT NOT NULL,
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
        CREATE UNIQUE INDEX IF NOT EXISTS "Student_username_key" ON "Student"("username");
      `);
    } catch (ddlError) {
      console.warn('Note: Auto DDL skipped or not applicable (e.g., MySQL):', ddlError);
    }

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
        username: 'jdelacruz',
        name: 'Juan Dela Cruz',
        program: 'BSED - Major in English',
        spId: sp.id,
        ctId: createdCTs[0]?.id,
      },
      {
        studentId: '2021-10511',
        username: 'ksalazar',
        name: 'Kristine Mae Salazar',
        program: 'BSED - Major in Mathematics',
        spId: sp.id,
        ctId: createdCTs[1]?.id,
      },
      {
        studentId: '2021-10678',
        username: 'abautista',
        name: 'Alvin Mark Bautista',
        program: 'BSED - Major in General Science',
        spId: sp.id,
        ctId: createdCTs[2]?.id,
      },
      {
        studentId: '2021-10988',
        username: 'pvelasco',
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
        update: { ctId: st.ctId, spId: st.spId, username: st.username },
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to seed database';
    console.error('Seed API error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
