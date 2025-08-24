import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { checkFeatureAccess, incrementUsage, getAllUserUsage } from '@/lib/usage';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature');

    if (feature) {
      // Get usage for specific feature
      const { allowed, usageInfo } = await checkFeatureAccess(session.userId, feature);
      
      return NextResponse.json({
        allowed,
        usage: usageInfo
      });
    } else {
      // Get all usage
      const usage = await getAllUserUsage(session.userId);
      
      return NextResponse.json({
        usage
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feature, amount = 1 } = await request.json();

    if (!feature) {
      return NextResponse.json({ error: 'Feature is required' }, { status: 400 });
    }

    // Check if user can use this feature
    const { allowed, usageInfo } = await checkFeatureAccess(session.userId, feature);

    if (!allowed) {
      return NextResponse.json({
        error: 'Usage limit exceeded',
        usage: usageInfo
      }, { status: 429 });
    }

    // Increment usage
    const updatedUsage = await incrementUsage(session.userId, feature, amount);

    return NextResponse.json({
      success: true,
      usage: updatedUsage
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
