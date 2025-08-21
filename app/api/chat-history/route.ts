import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, context: { params: Promise<any> }) {
  try {
    await context.params
    const session = await getServerSession(authOptions)
    console.log('Session in GET:', session)
    
    if (!session?.userId) {
      console.log('No session or userId found in GET')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Fetching sessions for userId:', session.userId)
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.userId
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log('Found sessions:', chatSessions.length)
    return NextResponse.json({ sessions: chatSessions })

  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: { params: Promise<any> }) {
  try {
    await context.params
    const session = await getServerSession(authOptions)
    console.log('Session in POST:', session)
    
    if (!session?.userId) {
      console.log('No session or userId found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { pdfFileName, pdfText, summary } = body
    console.log('Creating session with:', { pdfFileName, summary, userId: session.userId })

    if (!pdfFileName || !pdfText || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.userId,
        pdfFileName,
        pdfText,
        summary
      },
      include: {
        messages: true
      }
    })

    console.log('Session created:', chatSession.id)
    return NextResponse.json({ session: chatSession })

  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
