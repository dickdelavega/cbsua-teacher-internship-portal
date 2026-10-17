import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
  __schemaEnsuredPromise?: Promise<void>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export async function ensureDatabaseSchema(): Promise<void> {
  if (globalThis.__schemaEnsuredPromise) return globalThis.__schemaEnsuredPromise;

  globalThis.__schemaEnsuredPromise = (async () => {
    const url = process.env.DATABASE_URL;
    if (url && (url.startsWith('postgres') || url.startsWith('postgresql'))) {
      const ddlStatements = [
        `CREATE TABLE IF NOT EXISTS "Dean" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "title" TEXT NOT NULL DEFAULT 'Dean, College of Education',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS "SupervisingProfessor" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "name" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "program" TEXT DEFAULT 'Bachelor of Secondary Education',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS "CooperatingTeacher" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "school" TEXT NOT NULL,
          "gradeLevel" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS "Student" (
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
        )`,
        `CREATE TABLE IF NOT EXISTS "EvaluationCT" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "teacherName" TEXT NOT NULL,
          "schoolName" TEXT NOT NULL,
          "responses" JSONB NOT NULL,
          "comments" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS "EvaluationSP" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "profName" TEXT NOT NULL,
          "program" TEXT NOT NULL,
          "responses" JSONB NOT NULL,
          "comments" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "username" TEXT`,
        `ALTER TABLE "SupervisingProfessor" ADD COLUMN IF NOT EXISTS "program" TEXT DEFAULT 'Bachelor of Secondary Education'`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Student_username_key" ON "Student"("username")`,
      ];

      for (const sql of ddlStatements) {
        try {
          await (prisma as any).$executeRawUnsafe(sql);
        } catch (err: any) {
          console.warn('[ensureDatabaseSchema] DDL note:', err?.message || err);
        }
      }
      console.log('[ensureDatabaseSchema] Schema verified on PostgreSQL.');
    }
  })();

  return globalThis.__schemaEnsuredPromise;
}
