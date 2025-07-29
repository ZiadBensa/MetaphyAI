import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/documents - Get all documents for the current user
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const userId = token.sub;
  try {
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ documents });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents - Save a new document record for the current user
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const userId = token.sub;
  const { fileName, mimeType, driveFileId, webViewLink, webContentLink } = await req.json();
  if (!fileName || !mimeType || !driveFileId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const document = await prisma.document.create({
      data: {
        userId,
        fileName,
        mimeType,
        driveFileId,
        webViewLink,
        webContentLink,
      },
    });
    return NextResponse.json({ document });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save document' }, { status: 500 });
  }
} 