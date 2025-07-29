import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
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
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
  }
  try {
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
    return NextResponse.json({ files: res.data.files || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list files' }, { status: 500 });
  }
} 