import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = request.cookies.get('admin_session');
    if (adminSession?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, testData } = await request.json();

    let response;
    let testResult;

    switch (endpoint) {
      case 'pdf_chat':
        // Test PDF chat endpoint
        response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pdf-summarizer/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: testData?.message || 'Test message from admin panel',
            sessionId: 'admin-test-session',
          }),
        });
        
        testResult = await response.json();
        break;

      case 'image_generation':
        // Test image generation endpoint
        response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/image-generator/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: testData?.prompt || 'A beautiful landscape',
            numImages: 1,
            width: 512,
            height: 512,
          }),
        });
        
        testResult = await response.json();
        break;

      case 'text_humanizer':
        // Test text humanizer endpoint
        response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/text-humanizer/humanize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: testData?.text || 'This is a test text for humanization.',
            model: 'gpt-3.5-turbo',
          }),
        });
        
        testResult = await response.json();
        break;

      case 'subscription':
        // Test subscription endpoint
        response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/subscription`, {
          method: 'GET',
        });
        
        testResult = await response.json();
        break;

      case 'usage':
        // Test usage endpoint
        response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/usage`, {
          method: 'GET',
        });
        
        testResult = await response.json();
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
      status: response.status,
      result: testResult,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Admin test endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
