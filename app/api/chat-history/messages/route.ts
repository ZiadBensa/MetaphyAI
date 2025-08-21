import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest, context: { params: Promise<any> }) {
  try {
    await context.params
    const session = await getServerSession(authOptions)
    console.log('Session in messages POST:', session)
    
    if (!session?.userId) {
      console.log('No session or userId found in messages POST')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId, role, content } = body
    console.log('Adding message:', { sessionId, role, contentLength: content?.length })

    if (!sessionId || !role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the session belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.userId
      }
    })

    if (!chatSession) {
      console.log('Chat session not found:', sessionId)
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    console.log('Found chat session, creating message')
    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content
      }
    })

    // Update the session's updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })

    console.log('Message created:', message.id)
    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error adding message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
