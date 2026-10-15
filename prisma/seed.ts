import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial CBSUA database...');

  // 1. Create or upsert Supervising Professor
  const sp = await prisma.supervisingProfessor.upsert({
    where: { email: 'mesantos@cbsua.edu.ph' },
    update: {},
    create: {
      name: 'Dr. Maria Elena Santos',
      email: 'mesantos@cbsua.edu.ph',
      password: 'password123',
    },
  });
  console.log('Supervising Professor:', sp.name);

  // 2. Create Cooperating Teachers
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
  console.log(`Cooperating Teachers verified: ${createdCTs.length}`);

  // 3. Create Students
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

  for (const st of students) {
    await prisma.student.upsert({
      where: { studentId: st.studentId },
      update: { ctId: st.ctId, spId: st.spId },
      create: {
        ...st,
        password: 'password123',
      },
    });
  }
  console.log(`Students enrolled & assigned: ${students.length}`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
