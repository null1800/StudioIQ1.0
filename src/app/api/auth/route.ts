import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, displayName } = body;

    switch (action) {
      case 'signup':
        if (!email || !password) {
          return NextResponse.json(
            { success: false, error: 'Email and password required' },
            { status: 400 }
          );
        }
        const signupResult = await authService.signUp(email, password, displayName);
        return NextResponse.json(signupResult);

      case 'signin':
        if (!email || !password) {
          return NextResponse.json(
            { success: false, error: 'Email and password required' },
            { status: 400 }
          );
        }
        const signinResult = await authService.signIn(email, password);
        return NextResponse.json(signinResult);

      case 'signout':
        const signoutResult = await authService.signOut();
        return NextResponse.json({ success: signoutResult });

      case 'reset-password':
        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email required' },
            { status: 400 }
          );
        }
        const resetResult = await authService.resetPassword(email);
        return NextResponse.json({ success: resetResult });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await authService.getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, user });
}
