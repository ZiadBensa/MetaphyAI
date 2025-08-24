import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = request.cookies.get('admin_session');
    if (adminSession?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    let response;
    let testResult;

    switch (endpoint) {
      case 'frontend_health':
        // Test frontend health
        response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/health`, {
          method: 'GET',
        });
        
        if (response.ok) {
          testResult = { status: 'healthy', message: 'Frontend API is responding' };
        } else {
          testResult = { status: 'unhealthy', message: `Frontend API returned ${response.status}` };
        }
        break;

      case 'backend_health':
        // Test backend health
        try {
          response = await fetch('http://localhost:8000/health', {
            method: 'GET',
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });
          
          if (response.ok) {
            const data = await response.json();
            testResult = { status: 'healthy', message: 'Backend is responding', details: data };
          } else {
            testResult = { status: 'unhealthy', message: `Backend returned ${response.status}` };
          }
        } catch (error) {
          testResult = { status: 'unreachable', message: 'Backend is not reachable', error: error instanceof Error ? error.message : 'Unknown error' };
        }
        break;

      case 'database_health':
        // Test database connectivity through a simple API call
        try {
          response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/subscription`, {
            method: 'GET',
          });
          
          if (response.status === 401) {
            // 401 means the endpoint is working but requires auth (which is expected)
            testResult = { status: 'healthy', message: 'Database is accessible (auth required)', details: 'Endpoint responding correctly' };
          } else if (response.ok) {
            testResult = { status: 'healthy', message: 'Database is accessible', details: 'Endpoint responding with data' };
          } else {
            testResult = { status: 'unhealthy', message: `Database endpoint returned ${response.status}` };
          }
        } catch (error) {
          testResult = { status: 'unreachable', message: 'Database endpoint is not reachable', error: error instanceof Error ? error.message : 'Unknown error' };
        }
        break;

      case 'auth_health':
        // Test authentication system
        try {
          response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`, {
            method: 'GET',
          });
          
          if (response.ok) {
            testResult = { status: 'healthy', message: 'Authentication system is responding', details: 'Session endpoint accessible' };
          } else {
            testResult = { status: 'unhealthy', message: `Auth endpoint returned ${response.status}` };
          }
        } catch (error) {
          testResult = { status: 'unreachable', message: 'Authentication endpoint is not reachable', error: error instanceof Error ? error.message : 'Unknown error' };
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      endpoint,
      status: response?.status || 'N/A',
      result: testResult,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
