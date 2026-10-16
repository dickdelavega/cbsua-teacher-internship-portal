import { NextResponse } from 'next/server';
import { verifyDeanLogin } from '@/lib/dean-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const dean = await verifyDeanLogin(email, password);

    return NextResponse.json({
      success: true,
      message: 'Dean authentication successful!',
      data: dean,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid credentials.';
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
