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

    // Ensure user has a subscription
    await createDefaultSubscription(session.userId);

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.userId }
    });

    // Get all usage for the user
    const usage = await getAllUserUsage(session.userId);

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
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !PRICING_TIERS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // For now, just update the subscription plan
    // In a real implementation, you'd integrate with Stripe here
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
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
