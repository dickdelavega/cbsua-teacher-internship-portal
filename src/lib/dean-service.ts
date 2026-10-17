import prisma, { ensureDatabaseSchema } from '@/lib/prisma';
import { getFallbackStore } from '@/lib/sp-service';

export const EDUCATION_PROGRAMS = [
  'Bachelor of Secondary Education',
  'Bachelor of Elementary Education',
  'Bachelor of Technology and Livelihood Education',
] as const;

export type EducationProgram = (typeof EDUCATION_PROGRAMS)[number];

export interface DeanProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
}

export interface SupervisingProfessorAssignment {
  id: string;
  name: string;
  email: string;
  program: string;
  studentsCount: number;
  evaluatedStudentsCount: number;
  createdAt: string;
}

export interface ProgramOverviewStat {
  program: string;
  shortCode: string;
  supervisingProfessorsCount: number;
  studentsCount: number;
  professors: { id: string; name: string; email: string }[];
}

async function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export async function verifyDeanLogin(email: string, passwordAttempt: string): Promise<DeanProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = passwordAttempt.trim();

  try {
    const dean = await withTimeout(
      prisma.dean.findUnique({
        where: { email: cleanEmail },
      }),
      2500
    );

    if (dean) {
      if (dean.password !== cleanPass) {
        throw new Error('Invalid institutional email or password.');
      }
      return {
        id: dean.id,
        name: dean.name,
        email: dean.email,
        title: dean.title,
        department: 'College of Education - Office of the Dean',
      };
    }
  } catch (err: any) {
    if (err.message === 'Invalid institutional email or password.') {
      throw err;
    }
  }

  // Fallback check
  const fb = getFallbackStore();
  const fbDean = fb.dean || {
    id: 'dean-01',
    name: 'Dr. Raquel M. Reapor, Ed.D.',
    email: 'dean.education@cbsua.edu.ph',
    password: 'password123',
    title: 'Dean, College of Education',
  };

  if (fbDean.email.toLowerCase() === cleanEmail && fbDean.password === cleanPass) {
    return {
      id: fbDean.id,
      name: fbDean.name,
      email: fbDean.email,
      title: fbDean.title,
      department: 'College of Education - Office of the Dean',
    };
  }

  throw new Error('Invalid institutional email or password.');
}

export async function getDeanProfile(): Promise<DeanProfile> {
  try {
    const dean = await withTimeout(prisma.dean.findFirst(), 2500);
    if (dean) {
      return {
        id: dean.id,
        name: dean.name,
        email: dean.email,
        title: dean.title,
        department: 'College of Education - Office of the Dean',
      };
    }
  } catch (err) {
    // Fallback
  }

  const fb = getFallbackStore();
  const fbDean = fb.dean || {
    id: 'dean-01',
    name: 'Dr. Raquel M. Reapor, Ed.D.',
    email: 'dean.education@cbsua.edu.ph',
    title: 'Dean, College of Education',
  };

  return {
    id: fbDean.id,
    name: fbDean.name,
    email: fbDean.email,
    title: fbDean.title,
    department: 'College of Education - Office of the Dean',
  };
}

export async function getDeanSupervisingProfessors(): Promise<SupervisingProfessorAssignment[]> {
  await ensureDatabaseSchema();
  try {
    const professors = await withTimeout(
      prisma.supervisingProfessor.findMany({
        include: {
          students: {
            include: {
              evaluationsCT: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      3500
    );

    if (professors) {
      return professors.map((p) => {
        const evaluatedCount = p.students.filter(
          (st) => st.evaluationsCT && st.evaluationsCT.length > 0
        ).length;

        return {
          id: p.id,
          name: p.name,
          email: p.email,
          program: p.program || 'Bachelor of Secondary Education',
          studentsCount: p.students.length,
          evaluatedStudentsCount: evaluatedCount,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.warn('[getDeanSupervisingProfessors] Database query error:', err);
    try {
      const simpleProfs = await prisma.supervisingProfessor.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (simpleProfs && simpleProfs.length > 0) {
        return simpleProfs.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          program: p.program || 'Bachelor of Secondary Education',
          studentsCount: 0,
          evaluatedStudentsCount: 0,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (simpleErr) {
      console.warn('[getDeanSupervisingProfessors] Simple query error:', simpleErr);
    }
  }

  const fb = getFallbackStore();
  const fbProfessors = fb.professors || [];

  return fbProfessors.map((p: any) => {
    const assignedStudents = fb.students.filter((st: any) => st.spId === p.id);
    const evaluatedCount = assignedStudents.filter((st: any) => !!st.evaluationCT).length;

    return {
      id: p.id,
      name: p.name,
      email: p.email,
      program: p.program || 'Bachelor of Secondary Education',
      studentsCount: assignedStudents.length,
      evaluatedStudentsCount: evaluatedCount,
      createdAt: p.createdAt || new Date().toISOString(),
    };
  });
}

export async function assignSupervisingProfessorProgram(
  spId: string,
  newProgram: string
): Promise<{ success: boolean; message: string; professor: any }> {
  if (!EDUCATION_PROGRAMS.includes(newProgram as any)) {
    throw new Error(
      `Invalid degree program. Must be one of: ${EDUCATION_PROGRAMS.join(', ')}`
    );
  }

  const cleanSpId = spId?.trim();
  const legacyEmailMap: Record<string, string> = {
    'sp-cbsua-01': 'mesantos@cbsua.edu.ph',
    'sp-cbsua-02': 'rmendoza@cbsua.edu.ph',
    'sp-cbsua-03': 'cocampo@cbsua.edu.ph',
    'sp-cbsua-04': 'dbautista@cbsua.edu.ph',
  };
  const targetEmail = cleanSpId ? (legacyEmailMap[cleanSpId] || (cleanSpId.includes('@') ? cleanSpId : null)) : null;

  await ensureDatabaseSchema();

  try {
    const prof = await prisma.supervisingProfessor.findFirst({
      where: {
        OR: [
          { id: cleanSpId },
          { email: cleanSpId.toLowerCase() },
          ...(targetEmail ? [{ email: targetEmail.toLowerCase() }] : []),
        ],
      },
    });

    if (prof) {
      const updated = await withTimeout(
        prisma.supervisingProfessor.update({
          where: { id: prof.id },
          data: { program: newProgram },
        }),
        4000
      );

      // Keep fallback in sync
      const fb = getFallbackStore();
      const fbProf = fb.professors.find(
        (p: any) => p.id === prof.id || p.email.toLowerCase() === prof.email.toLowerCase()
      );
      if (fbProf) {
        fbProf.program = newProgram;
      }

      return {
        success: true,
        message: `Supervising Professor ${updated.name} successfully assigned to ${newProgram}.`,
        professor: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          program: updated.program,
        },
      };
    }
  } catch (err: any) {
    console.error('[assignSupervisingProfessorProgram] Database update failed:', err);
    throw new Error(
      `Database error: Could not update program for supervising professor (${err?.message || 'Connection failed'}).`
    );
  }

  // Fallback store update if not found in DB
  const fb = getFallbackStore();
  const fbProf = fb.professors.find(
    (p: any) =>
      p.id === cleanSpId ||
      p.email.toLowerCase() === cleanSpId.toLowerCase() ||
      (targetEmail && p.email.toLowerCase() === targetEmail.toLowerCase())
  );

  if (!fbProf) {
    throw new Error('Supervising Professor not found.');
  }

  fbProf.program = newProgram;
  return {
    success: true,
    message: `Supervising Professor ${fbProf.name} successfully assigned to ${newProgram}.`,
    professor: {
      id: fbProf.id,
      name: fbProf.name,
      email: fbProf.email,
      program: fbProf.program,
    },
  };
}

export async function createSupervisingProfessorByDean(data: {
  name: string;
  email: string;
  program: string;
  temporaryPassword?: string;
}): Promise<SupervisingProfessorAssignment> {
  const cleanName = data.name.trim();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPass = data.temporaryPassword?.trim() || 'password123';
  const cleanProgram = data.program?.trim() || 'Bachelor of Secondary Education';

  if (!EDUCATION_PROGRAMS.includes(cleanProgram as any)) {
    throw new Error(
      `Invalid program. Permitted: ${EDUCATION_PROGRAMS.join(', ')}`
    );
  }

  await ensureDatabaseSchema();

  try {
    const created = await withTimeout(
      prisma.supervisingProfessor.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: cleanPass,
          program: cleanProgram,
        },
      }),
      4000
    );

    // Keep fallback in sync
    const fb = getFallbackStore();
    const existingIdx = fb.professors.findIndex((p: any) => p.email.toLowerCase() === cleanEmail);
    const safeProf = {
      id: created.id,
      name: created.name,
      email: created.email,
      password: cleanPass,
      program: created.program || cleanProgram,
      department: `College of Education - ${cleanProgram}`,
      createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      fb.professors[existingIdx] = safeProf;
    } else {
      fb.professors.unshift(safeProf);
    }

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      program: created.program || cleanProgram,
      studentsCount: 0,
      evaluatedStudentsCount: 0,
      createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString(),
    };
  } catch (err: any) {
    if (
      err?.code === 'P2002' ||
      err?.message?.includes('Unique constraint') ||
      err?.message?.includes('Duplicate entry')
    ) {
      throw new Error(`A Supervising Professor with email ${cleanEmail} already exists.`);
    }

    console.error('[createSupervisingProfessorByDean] Database create failed:', err);

    throw new Error(
      `Database error: Could not save supervising professor (${err?.message || 'Connection failed'}). Check database configuration.`
    );
  }
}

export async function getDeanCollegeOverview(): Promise<{
  totalSupervisingProfessors: number;
  totalStudents: number;
  totalCooperatingTeachers: number;
  programStats: ProgramOverviewStat[];
}> {
  const professors = await getDeanSupervisingProfessors();
  const fb = getFallbackStore();

  let allStudents: any[] = [];
  try {
    const dbStudents = await withTimeout(
      prisma.student.findMany({ select: { id: true, program: true, spId: true } }),
      2500
    );
    if (dbStudents && dbStudents.length > 0) {
      allStudents = dbStudents;
    } else {
      allStudents = fb.students;
    }
  } catch {
    allStudents = fb.students;
  }

  const shortCodeMap: Record<string, string> = {
    'Bachelor of Secondary Education': 'BSED',
    'Bachelor of Elementary Education': 'BEED',
    'Bachelor of Technology and Livelihood Education': 'BTLEd',
  };

  const programStats: ProgramOverviewStat[] = EDUCATION_PROGRAMS.map((prog) => {
    const profsInProgram = professors.filter((p) => p.program === prog);
    const studentsInProg = allStudents.filter(
      (s) =>
        s.program === prog ||
        (s.program && s.program.toLowerCase().includes(prog.toLowerCase())) ||
        (prog === 'Bachelor of Secondary Education' && s.program?.startsWith('BSED')) ||
        (prog === 'Bachelor of Elementary Education' && s.program?.startsWith('BEED')) ||
        (prog === 'Bachelor of Technology and Livelihood Education' && s.program?.startsWith('BTLE'))
    );

    return {
      program: prog,
      shortCode: shortCodeMap[prog] || 'EDUC',
      supervisingProfessorsCount: profsInProgram.length,
      studentsCount: studentsInProg.length,
      professors: profsInProgram.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
      })),
    };
  });

  return {
    totalSupervisingProfessors: professors.length,
    totalStudents: allStudents.length,
    totalCooperatingTeachers: fb.cooperatingTeachers ? fb.cooperatingTeachers.length : 4,
    programStats,
  };
}
