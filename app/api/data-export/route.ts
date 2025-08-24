import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        chatSessions: {
          include: {
            messages: true
          }
        },
        subscription: true,
        usageRecords: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare export data
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      subscription: user.subscription,
      usageRecords: user.usageRecords,
      chatSessions: user.chatSessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages.map(message => ({
          id: message.id,
          content: message.content,
          role: message.role,
          timestamp: message.timestamp
        }))
      })),
      exportDate: new Date().toISOString()
    };

    // In a real application, you would:
    // 1. Generate a file (JSON, CSV, etc.)
    // 2. Store it temporarily or send via email
    // 3. Return a download link or confirmation

    return NextResponse.json({
      success: true,
      message: 'Data export prepared successfully',
      data: exportData,
      downloadUrl: null, // Would be generated in real implementation
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
