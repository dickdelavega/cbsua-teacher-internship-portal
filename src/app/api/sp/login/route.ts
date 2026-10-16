import { NextResponse } from 'next/server';
import {
  verifySupervisingProfessorLogin,
  registerSupervisingProfessorAccount,
} from '@/lib/sp-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, isRegistering, name, program } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (isRegistering) {
      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Full name is required for registration.' },
          { status: 400 }
        );
      }
      const newProf = await registerSupervisingProfessorAccount({
        name,
        email,
        password,
        program,
      });
      return NextResponse.json({ success: true, data: newProf }, { status: 201 });
    }

    const prof = await verifySupervisingProfessorLogin(email, password);
    return NextResponse.json({ success: true, data: prof });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 400 }
    );
  }
}
