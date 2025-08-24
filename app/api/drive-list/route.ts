import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { google } from 'googleapis';

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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Debug: Log session info
  console.log('Session userId:', session.userId);
  console.log('Session keys:', Object.keys(session));
  console.log('Session accessToken:', (session as any).accessToken);

  try {
    // Get the access token from the session
    const accessToken = (session as any).accessToken;
    
    if (!accessToken) {
      return NextResponse.json({ 
        files: [],
        message: 'Google Drive access token not available. Please sign out and sign in again.',
        debug: {
          sessionKeys: Object.keys(session),
          hasAccessToken: !!(session as any).accessToken
        }
      });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const folderId = await getOrCreateAgoraAIFolder(drive);
    
    // List all files in the AgoraAI folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime)',
      spaces: 'drive',
    });
    
    return NextResponse.json({ 
      files: res.data.files || [],
      folderId: folderId
    });
  } catch (error: any) {
    console.error('Google Drive error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to access Google Drive',
      files: []
    }, { status: 500 });
  }
} 