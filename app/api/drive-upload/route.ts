import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '../auth/[...nextauth]/route';
import { google } from 'googleapis';
import { Readable } from 'stream';

// In the Next.js app directory, use getToken to extract the access token from cookies

async function getOrCreateAgoraAIFolder(drive: any) {
  // Search for folder
  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name='AgoraAI' and trashed=false",
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }
  // Create folder if not found
  const folder = await drive.files.create({
    requestBody: {
      name: 'AgoraAI',
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });
  return folder.data.id;
}

export async function POST(req: NextRequest) {
  // Use getToken to extract the access token from the request cookies
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken;
  
  if (!accessToken) {
    return NextResponse.json({ 
      error: 'Not authenticated with Google. Please sign in again.',
      details: 'No access token found'
    }, { status: 401 });
  }

  // Check if token is expired (Google tokens typically expire after 1 hour)
  const tokenExpiry = token?.exp;
  if (tokenExpiry && typeof tokenExpiry === 'number' && Date.now() / 1000 > tokenExpiry) {
    return NextResponse.json({ 
      error: 'Google access token has expired. Please sign in again.',
      details: 'Token expired'
    }, { status: 401 });
  }

  const { file, fileName, mimeType } = await req.json();
  if (!file || !fileName || !mimeType) {
    return NextResponse.json({ error: 'Missing file, fileName, or mimeType' }, { status: 400 });
  }
  
  // Ensure file is a valid data URL
  const base64Data = typeof file === 'string' && file.includes(',') ? file.split(',')[1] : undefined;
  if (!base64Data) {
    return NextResponse.json({ error: 'Invalid file data' }, { status: 400 });
  }
  
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Test the connection first
    try {
      await drive.about.get({ fields: 'user' });
    } catch (authError: any) {
      if (authError.code === 401) {
        return NextResponse.json({ 
          error: 'Google access token is invalid or expired. Please sign in again.',
          details: 'Authentication failed'
        }, { status: 401 });
      }
      throw authError;
    }
    
    // Find or create AgoraAI folder
    const folderId = await getOrCreateAgoraAIFolder(drive);
    
    // Upload file as a stream
    const buffer = Buffer.from(base64Data, 'base64');
    const stream = Readable.from(buffer);
    
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });
    
    return NextResponse.json({ success: true, file: res.data });
  } catch (err: any) {
    // Provide more specific error messages
    if (err.code === 401) {
      return NextResponse.json({ 
        error: 'Authentication failed. Please sign in again.',
        details: err.message
      }, { status: 401 });
    } else if (err.code === 403) {
      return NextResponse.json({ 
        error: 'Permission denied. Please check your Google Drive permissions.',
        details: err.message
      }, { status: 403 });
    } else if (err.code === 429) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.',
        details: err.message
      }, { status: 429 });
    } else if (err.code === 500 || err.code === 502 || err.code === 503) {
      return NextResponse.json({ 
        error: 'Google Drive service is temporarily unavailable. Please try again.',
        details: err.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Google Drive upload failed',
      details: err.message || 'Unknown error'
    }, { status: 500 });
  }
} 