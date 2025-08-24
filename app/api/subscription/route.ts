import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { getAllUserUsage, createDefaultSubscription } from '@/lib/usage';
import { PRICING_TIERS } from '@/lib/pricing';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Processing subscription GET for user:', session.userId);
    console.log('Session structure:', JSON.stringify(session, null, 2));

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // First, ensure the user exists in the database
    // Check by email first, then by ID
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.userId },
          ...(session.user?.email ? [{ email: session.user.email }] : [])
        ]
      }
    });

    if (!user) {
      // Create user if they don't exist
      const userData = {
        id: session.userId,
        email: session.user?.email || `user-${session.userId}@example.com`,
        name: session.user?.name || `User ${session.userId}`,
        googleId: session.userId, // Use session userId as googleId for now
      };
      console.log('Creating user with data:', userData);
      
      user = await prisma.user.create({
        data: userData
      });
      console.log('Created new user:', user);
    } else {
      console.log('Found existing user:', user);
      // Update the user ID if it's different
      if (user.id !== session.userId) {
        console.log('Updating user ID from', user.id, 'to', session.userId);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { id: session.userId }
        });
        console.log('Updated user:', user);
      }
    }

    // Ensure user has a subscription
    await createDefaultSubscription(session.userId);
    console.log('Default subscription created/updated');

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.userId }
    });
    console.log('Subscription found:', subscription);

    // Get all usage for the user
    const usage = await getAllUserUsage(session.userId);
    console.log('Usage data retrieved:', usage);

    // Get current plan details
    const currentPlan = subscription?.plan || 'free';
    const planDetails = PRICING_TIERS[currentPlan];

    return NextResponse.json({
      subscription: {
        plan: currentPlan,
        status: subscription?.status || 'active',
        startDate: subscription?.startDate,
        endDate: subscription?.endDate
      },
      usage,
      planDetails
    });
  } catch (error) {
    console.error('Subscription GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();
    console.log('Processing subscription POST for user:', session.userId, 'plan:', plan);
    console.log('Session structure:', JSON.stringify(session, null, 2));

    if (!plan || !PRICING_TIERS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // First, ensure the user exists in the database
    // Check by email first, then by ID
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.userId },
          ...(session.user?.email ? [{ email: session.user.email }] : [])
        ]
      }
    });

    if (!user) {
      // Create user if they don't exist
      const userData = {
        id: session.userId,
        email: session.user?.email || `user-${session.userId}@example.com`,
        name: session.user?.name || `User ${session.userId}`,
        googleId: session.userId, // Use session userId as googleId for now
      };
      console.log('Creating user with data:', userData);
      
      user = await prisma.user.create({
        data: userData
      });
      console.log('Created new user:', user);
    } else {
      console.log('Found existing user:', user);
      // Update the user ID if it's different
      if (user.id !== session.userId) {
        console.log('Updating user ID from', user.id, 'to', session.userId);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { id: session.userId }
        });
        console.log('Updated user:', user);
      }
    }

    // Now create/update the subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.userId },
      update: {
        plan,
        status: 'active',
        updatedAt: new Date()
      },
      create: {
        userId: session.userId,
        plan,
        status: 'active'
      }
    });

    console.log('Subscription updated/created:', subscription);

    return NextResponse.json({
      success: true,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate
      }
    });
  } catch (error) {
    console.error('Subscription POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
