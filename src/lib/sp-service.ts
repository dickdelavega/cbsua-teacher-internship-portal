import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export interface CooperatingTeacherData {
  id: string;
  name: string;
  school: string;
  gradeLevel: string;
  createdAt?: string;
}

export interface EvaluationCTData {
  id: string;
  teacherName: string;
  schoolName: string;
  responses: Record<string, string>;
  comments: string | null;
  rating: {
    average: number;
    totalQuestions: number;
    descriptor: string;
  };
  createdAt: string;
}

export interface StudentData {
  id: string;
  studentId: string;
  username?: string | null;
  name: string;
  program: string;
  spId?: string | null;
  ctId?: string | null;
  ct?: CooperatingTeacherData | null;
  evaluationCT?: EvaluationCTData | null;
  createdAt?: string;
}

export interface ProfessorProfile {
  id: string;
  name: string;
  email: string;
  department: string;
}

// In-memory store cache on globalThis to prevent any file system watching triggers
declare const globalThis: {
  __spStore?: any;
} & typeof global;

async function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

const defaultData = {
  professors: [
    {
      id: 'sp-cbsua-01',
      name: 'Dr. Maria Elena Santos',
      email: 'mesantos@cbsua.edu.ph',
      department: 'College of Education - Secondary Teaching',
    },
  ],
  cooperatingTeachers: [
    {
      id: 'ct-01',
      name: 'Mrs. Rochelle B. Alvarez, LPT',
      school: 'Pili National High School',
      gradeLevel: 'Grade 10 - English & Literature',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ct-02',
      name: 'Mr. Ferdinand G. Ramos, LPT',
      school: 'Camarines Sur National High School',
      gradeLevel: 'Grade 9 - Mathematics',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ct-03',
      name: 'Ms. Jocelyn P. De Leon, LPT',
      school: 'San Jose Integrated School',
      gradeLevel: 'Grade 7 - Science & Technology',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ct-04',
      name: 'Engr. Antonio M. Reyes, LPT',
      school: 'CBSUA Laboratory High School',
      gradeLevel: 'Grade 8 - Technology and Livelihood Education',
      createdAt: new Date().toISOString(),
    },
  ],
  students: [
    {
      id: 'stud-01',
      studentId: '2021-10492',
      username: 'jdelacruz',
      name: 'Juan Dela Cruz',
      program: 'BSED - Major in English',
      password: 'password123',
      spId: 'sp-cbsua-01',
      ctId: 'ct-01',
      evaluationCT: {
        id: 'eval-ct-01',
        teacherName: 'Mrs. Rochelle B. Alvarez, LPT',
        schoolName: 'Pili National High School',
        responses: { q1: '5', q2: '5', q3: '4', q4: '5', q5: '4' },
        comments: 'Outstanding instructional mastery and classroom presence.',
        rating: {
          average: 4.6,
          totalQuestions: 5,
          descriptor: 'Highly Observed',
        },
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'stud-02',
      studentId: '2021-10511',
      username: 'kmsalazar',
      name: 'Kristine Mae Salazar',
      program: 'BSED - Major in Mathematics',
      password: 'password123',
      spId: 'sp-cbsua-01',
      ctId: 'ct-02',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'stud-03',
      studentId: '2021-10678',
      username: 'ambautista',
      name: 'Alvin Mark Bautista',
      program: 'BSED - Major in General Science',
      password: 'password123',
      spId: 'sp-cbsua-01',
      ctId: 'ct-03',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'stud-04',
      studentId: '2021-10988',
      username: 'pvelasco',
      name: 'Patricia Nicole Velasco',
      program: 'BSED - Major in English',
      password: 'password123',
      spId: 'sp-cbsua-01',
      ctId: null,
      createdAt: new Date().toISOString(),
    },
  ],
};

function getFallbackStore() {
  if (!globalThis.__spStore) {
    globalThis.__spStore = JSON.parse(JSON.stringify(defaultData));
  }
  return globalThis.__spStore;
}

export async function getSupervisingProfessor() {
  try {
    const prof = await withTimeout(prisma.supervisingProfessor.findFirst(), 2500);
    if (prof) {
      return {
        id: prof.id,
        name: prof.name,
        email: prof.email,
        department: 'College of Education',
      };
    }
  } catch (err) {
    // DB not available or timeout, fallback
  }

  const fb = getFallbackStore();
  return fb.professors[0];
}

export async function getCooperatingTeachers(): Promise<CooperatingTeacherData[]> {
  try {
    const cts = await withTimeout(
      prisma.cooperatingTeacher.findMany({
        orderBy: { createdAt: 'desc' },
        include: { students: true },
      }),
      2500
    );
    if (cts && cts.length > 0) {
      return cts.map((ct) => ({
        id: ct.id,
        name: ct.name,
        school: ct.school,
        gradeLevel: ct.gradeLevel,
        createdAt: ct.createdAt ? new Date(ct.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err) {
    // DB error or timeout fallback
  }

  const fb = getFallbackStore();
  return fb.cooperatingTeachers;
}

export async function addCooperatingTeacher(data: {
  name: string;
  school: string;
  gradeLevel: string;
}): Promise<CooperatingTeacherData> {
  try {
    const created = await withTimeout(
      prisma.cooperatingTeacher.create({
        data: {
          name: data.name,
          school: data.school,
          gradeLevel: data.gradeLevel,
        },
      }),
      3000
    );
    return {
      id: created.id,
      name: created.name,
      school: created.school,
      gradeLevel: created.gradeLevel,
      createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString(),
    };
  } catch (err) {
    // Fallback in-memory store
    const fb = getFallbackStore();
    const newCt: CooperatingTeacherData = {
      id: `ct-${Date.now()}`,
      name: data.name,
      school: data.school,
      gradeLevel: data.gradeLevel,
      createdAt: new Date().toISOString(),
    };
    fb.cooperatingTeachers.unshift(newCt);
    return newCt;
  }
}

export function calculateCTRating(responses: any): {
  average: number;
  totalQuestions: number;
  descriptor: string;
} {
  if (!responses || typeof responses !== 'object') {
    return { average: 0, totalQuestions: 0, descriptor: 'Not Rated' };
  }
  const values = Object.values(responses)
    .map((v) => Number(v))
    .filter((n) => !isNaN(n) && n > 0);

  if (values.length === 0) {
    return { average: 0, totalQuestions: 0, descriptor: 'Not Rated' };
  }
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Number((sum / values.length).toFixed(2));
  let descriptor = 'Highly Observed';
  if (avg < 1.5) descriptor = 'Not Observed';
  else if (avg < 2.5) descriptor = 'Less Observed';
  else if (avg < 3.5) descriptor = 'Moderately Observed';
  else if (avg < 4.5) descriptor = 'Observed';

  return { average: avg, totalQuestions: values.length, descriptor };
}

export async function getEnrolledStudents(): Promise<StudentData[]> {
  try {
    const students = await withTimeout(
      prisma.student.findMany({
        include: {
          ct: true,
          evaluationsCT: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      2500
    );
    if (students && students.length > 0) {
      return students.map((s) => {
        const latestEval = s.evaluationsCT && s.evaluationsCT.length > 0 ? s.evaluationsCT[0] : null;
        return {
          id: s.id,
          studentId: s.studentId,
          username: s.username || s.studentId,
          name: s.name,
          program: s.program,
          spId: s.spId,
          ctId: s.ctId,
          ct: s.ct
            ? {
                id: s.ct.id,
                name: s.ct.name,
                school: s.ct.school,
                gradeLevel: s.ct.gradeLevel,
              }
            : null,
          evaluationCT: latestEval
            ? {
                id: latestEval.id,
                teacherName: latestEval.teacherName,
                schoolName: latestEval.schoolName,
                responses: latestEval.responses as any,
                comments: latestEval.comments,
                rating: calculateCTRating(latestEval.responses),
                createdAt: latestEval.createdAt ? new Date(latestEval.createdAt).toISOString() : new Date().toISOString(),
              }
            : null,
          createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    // DB error or timeout fallback
  }

  const fb = getFallbackStore();
  return fb.students.map((s: any) => {
    const ct = fb.cooperatingTeachers.find((c: any) => c.id === s.ctId) || null;
    const { password: _p, ...safe } = s;
    return {
      ...safe,
      username: safe.username || safe.studentId,
      ct,
      evaluationCT: safe.evaluationCT || null,
    };
  });
}

export async function enrollStudent(data: {
  studentId: string;
  username?: string | null;
  name: string;
  program: string;
  temporaryPassword?: string | null;
  ctId?: string | null;
}): Promise<StudentData> {
  const sp = await getSupervisingProfessor();
  const cleanStudentId = data.studentId.trim();
  const cleanUsername = (data.username && data.username.trim()) || cleanStudentId;
  const cleanPassword = (data.temporaryPassword && data.temporaryPassword.trim()) || 'password123';

  try {
    const created = await withTimeout(
      prisma.student.create({
        data: {
          studentId: cleanStudentId,
          username: cleanUsername,
          name: data.name.trim(),
          program: data.program.trim(),
          password: cleanPassword,
          spId: sp.id,
          ctId: data.ctId || null,
        },
        include: { ct: true },
      }),
      3500
    );
    return {
      id: created.id,
      studentId: created.studentId,
      username: created.username || created.studentId,
      name: created.name,
      program: created.program,
      spId: created.spId,
      ctId: created.ctId,
      ct: created.ct
        ? {
            id: created.ct.id,
            name: created.ct.name,
            school: created.ct.school,
            gradeLevel: created.ct.gradeLevel,
          }
        : null,
      createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString(),
    };
  } catch (err: any) {
    // Fallback store
    const fb = getFallbackStore();
    const existingIdx = fb.students.findIndex(
      (s: any) => s.studentId === cleanStudentId || (s.username && s.username === cleanUsername)
    );
    if (existingIdx >= 0) {
      throw new Error(`Student with ID ${cleanStudentId} or username ${cleanUsername} is already enrolled.`);
    }

    const newStudent: any = {
      id: `stud-${Date.now()}`,
      studentId: cleanStudentId,
      username: cleanUsername,
      name: data.name.trim(),
      program: data.program.trim(),
      password: cleanPassword,
      spId: sp.id,
      ctId: data.ctId || null,
      createdAt: new Date().toISOString(),
    };
    fb.students.unshift(newStudent);

    const ct = fb.cooperatingTeachers.find((c: any) => c.id === newStudent.ctId) || null;
    const { password: _p, ...safe } = newStudent;
    return {
      ...safe,
      ct,
    };
  }
}

export async function resetStudentPassword(
  studentIdentifier: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const cleanPassword = newPassword.trim();
  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  try {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { studentId: studentIdentifier },
          { id: studentIdentifier },
          { username: studentIdentifier },
        ],
      },
    });

    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: { password: cleanPassword },
      });
      return {
        success: true,
        message: `Password for student ${student.name} was successfully updated.`,
      };
    }
  } catch (err) {
    // Fallback
  }

  const fb = getFallbackStore();
  const st = fb.students.find(
    (s: any) =>
      s.studentId === studentIdentifier ||
      s.id === studentIdentifier ||
      s.username === studentIdentifier
  );
  if (!st) {
    throw new Error('Student account not found.');
  }

  st.password = cleanPassword;
  return {
    success: true,
    message: `Password for student ${st.name} was successfully updated.`,
  };
}

export async function changeStudentPassword(
  studentIdentifier: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const cleanCurr = currentPassword.trim();
  const cleanNew = newPassword.trim();

  if (!cleanNew || cleanNew.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  try {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { studentId: studentIdentifier },
          { id: studentIdentifier },
          { username: studentIdentifier },
        ],
      },
    });

    if (student) {
      if (student.password !== cleanCurr) {
        throw new Error('The current password you entered is incorrect.');
      }

      await prisma.student.update({
        where: { id: student.id },
        data: { password: cleanNew },
      });

      return {
        success: true,
        message: 'Your password has been changed successfully.',
      };
    }
  } catch (err: any) {
    if (err.message === 'The current password you entered is incorrect.') {
      throw err;
    }
  }

  const fb = getFallbackStore();
  const st = fb.students.find(
    (s: any) =>
      s.studentId === studentIdentifier ||
      s.id === studentIdentifier ||
      s.username === studentIdentifier
  );

  if (!st) {
    throw new Error('Student account not found.');
  }

  if (st.password && st.password !== cleanCurr) {
    throw new Error('The current password you entered is incorrect.');
  }

  st.password = cleanNew;
  return {
    success: true,
    message: 'Your password has been changed successfully.',
  };
}

export async function verifyStudentLogin(
  identifier: string,
  passwordAttempt: string
): Promise<StudentData> {
  const cleanId = identifier.trim();
  const cleanPass = passwordAttempt.trim();

  try {
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ studentId: cleanId }, { username: cleanId }],
      },
      include: {
        ct: true,
        sp: true,
      },
    });

    if (student) {
      if (student.password !== cleanPass) {
        throw new Error('Invalid username/student ID or password.');
      }

      return {
        id: student.id,
        studentId: student.studentId,
        username: student.username || student.studentId,
        name: student.name,
        program: student.program,
        spId: student.spId,
        ctId: student.ctId,
        ct: student.ct
          ? {
              id: student.ct.id,
              name: student.ct.name,
              school: student.ct.school,
              gradeLevel: student.ct.gradeLevel,
            }
          : null,
        createdAt: student.createdAt.toISOString(),
      };
    }
  } catch (err: any) {
    if (err.message === 'Invalid username/student ID or password.') {
      throw err;
    }
  }

  const fb = getFallbackStore();
  const st = fb.students.find(
    (s: any) => s.studentId === cleanId || s.username === cleanId
  );

  if (!st) {
    throw new Error('Invalid username/student ID or password.');
  }

  if (st.password && st.password !== cleanPass) {
    throw new Error('Invalid username/student ID or password.');
  }

  const ct = fb.cooperatingTeachers.find((c: any) => c.id === st.ctId) || null;
  const { password: _p, ...safe } = st;
  return {
    ...safe,
    username: safe.username || safe.studentId,
    ct,
  };
}

export async function assignStudentToCooperatingTeacher(
  studentDbId: string,
  ctId: string | null
): Promise<StudentData> {
  try {
    const updated = await prisma.student.update({
      where: { id: studentDbId },
      data: {
        ctId: ctId || null,
      },
      include: { ct: true },
    });
    return {
      id: updated.id,
      studentId: updated.studentId,
      name: updated.name,
      program: updated.program,
      spId: updated.spId,
      ctId: updated.ctId,
      ct: updated.ct
        ? {
            id: updated.ct.id,
            name: updated.ct.name,
            school: updated.ct.school,
            gradeLevel: updated.ct.gradeLevel,
          }
        : null,
      createdAt: updated.createdAt.toISOString(),
    };
  } catch (err) {
    const fb = getFallbackStore();
    const st = fb.students.find((s: any) => s.id === studentDbId || s.studentId === studentDbId);
    if (!st) {
      throw new Error('Student not found');
    }
    st.ctId = ctId || null;
    const ct = fb.cooperatingTeachers.find((c: any) => c.id === st.ctId) || null;
    return {
      ...st,
      ct,
    };
  }
}

export async function getStudentProfile(studentIdOrDbId?: string) {
  try {
    let student = null;
    const includeQuery = {
      ct: true,
      sp: true,
      evaluationsCT: {
        orderBy: { createdAt: 'desc' as const },
        take: 1,
      },
    };

    if (studentIdOrDbId) {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { studentId: studentIdOrDbId },
            { id: studentIdOrDbId },
            { username: studentIdOrDbId },
          ],
        },
        include: includeQuery,
      });
    }

    if (!student) {
      // Default to the first seeded enrolled student (e.g. 2021-10492) or first available
      student = await prisma.student.findFirst({
        where: { studentId: '2021-10492' },
        include: includeQuery,
      });
      if (!student) {
        student = await prisma.student.findFirst({
          include: includeQuery,
        });
      }
    }

    if (student) {
      const latestEval = student.evaluationsCT && student.evaluationsCT.length > 0 ? student.evaluationsCT[0] : null;
      return {
        id: student.id,
        studentId: student.studentId,
        username: student.username || student.studentId,
        name: student.name,
        program: student.program,
        spId: student.spId,
        ctId: student.ctId,
        sp: student.sp
          ? {
              id: student.sp.id,
              name: student.sp.name,
              email: student.sp.email,
              department: 'College of Education - Department of Teacher Internship',
            }
          : null,
        ct: student.ct
          ? {
              id: student.ct.id,
              name: student.ct.name,
              school: student.ct.school,
              gradeLevel: student.ct.gradeLevel,
            }
          : null,
        evaluationCT: latestEval
          ? {
              id: latestEval.id,
              teacherName: latestEval.teacherName,
              schoolName: latestEval.schoolName,
              responses: latestEval.responses as any,
              comments: latestEval.comments,
              rating: calculateCTRating(latestEval.responses),
              createdAt: latestEval.createdAt.toISOString(),
            }
          : null,
      };
    }
  } catch (err) {
    // DB error fallback
  }

  const fb = getFallbackStore();
  let st = null;
  if (studentIdOrDbId) {
    st = fb.students.find(
      (s: any) =>
        s.studentId === studentIdOrDbId ||
        s.id === studentIdOrDbId ||
        s.username === studentIdOrDbId
    );
  }
  if (!st) {
    st = fb.students[0];
  }
  if (!st) return null;

  const ct = fb.cooperatingTeachers.find((c: any) => c.id === st.ctId) || null;
  const sp = fb.professors[0] || null;
  const { password: _p, ...safeSt } = st;

  return {
    ...safeSt,
    username: safeSt.username || safeSt.studentId,
    ct,
    sp,
  };
}
