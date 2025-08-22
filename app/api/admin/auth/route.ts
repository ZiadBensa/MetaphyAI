import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'admin123'; // You can change this password

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password === ADMIN_PASSWORD) {
      // Set admin session cookie (24 hours)
      const response = NextResponse.json({ success: true, message: 'Admin access granted' });
      response.cookies.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin_session');
    
    if (adminSession?.value === 'true') {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
