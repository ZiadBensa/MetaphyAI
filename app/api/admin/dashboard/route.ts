import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = request.cookies.get('admin_session');
    if (adminSession?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with their subscriptions and usage
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        usageRecords: {
          where: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        },
        _count: {
          select: {
            chatSessions: true,
            billingHistory: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get system statistics
    const totalUsers = await prisma.user.count();
    const totalSubscriptions = await prisma.subscription.count();
    const totalUsageRecords = await prisma.usageRecord.count();
    const totalChatSessions = await prisma.chatSession.count();

    // Get current month usage summary
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlyUsage = await prisma.usageRecord.groupBy({
      by: ['feature'],
      where: {
        month: currentMonth,
        year: currentYear,
      },
      _sum: {
        usageCount: true,
      },
    });

    return NextResponse.json({
      users,
      statistics: {
        totalUsers,
        totalSubscriptions,
        totalUsageRecords,
        totalChatSessions,
        monthlyUsage,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = request.cookies.get('admin_session');
    if (adminSession?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userId, feature } = await request.json();

    switch (action) {
      case 'reset_usage':
        if (!userId || !feature) {
          return NextResponse.json(
            { error: 'Missing userId or feature' },
            { status: 400 }
          );
        }

        // Reset specific feature usage for user
        await prisma.usageRecord.updateMany({
          where: {
            userId,
            feature,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
          data: {
            usageCount: 0,
          },
        });

        return NextResponse.json({ success: true, message: 'Usage reset successfully' });

      case 'reset_all_usage':
        if (!userId) {
          return NextResponse.json(
            { error: 'Missing userId' },
            { status: 400 }
          );
        }

        // Reset all usage for user
        await prisma.usageRecord.updateMany({
          where: {
            userId,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
          data: {
            usageCount: 0,
          },
        });

        return NextResponse.json({ success: true, message: 'All usage reset successfully' });

      case 'delete_user':
        if (!userId) {
          return NextResponse.json(
            { error: 'Missing userId' },
            { status: 400 }
          );
        }

        // Delete user and all related data
        await prisma.user.delete({
          where: { id: userId },
        });

        return NextResponse.json({ success: true, message: 'User deleted successfully' });

      case 'reset_to_free':
        if (!userId) {
          return NextResponse.json(
            { error: 'Missing userId' },
            { status: 400 }
          );
        }

        // Reset user's subscription back to free plan
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: 'free',
            status: 'active',
            updatedAt: new Date(),
          },
          create: {
            userId,
            plan: 'free',
            status: 'active',
          },
        });

        // Also reset all usage for the user
        await prisma.usageRecord.updateMany({
          where: {
            userId,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
          data: {
            usageCount: 0,
          },
        });

        return NextResponse.json({ 
          success: true, 
          message: 'User reset to free plan and usage cleared successfully' 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
