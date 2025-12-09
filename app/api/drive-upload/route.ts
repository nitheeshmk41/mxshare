import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import stream from 'stream';
import db from '@/lib/db';
import Notification from '@/lib/models/Notification';

export const runtime = 'nodejs';

const SUPER_ADMIN_EMAIL = process.env.ALERT_ADMIN_EMAIL || '25mx336@psgtech.ac.in';
const BANNED_KEYWORDS = [
  'sex','porn','xxx','18+','nsfw','nude','erotic','adult','hardcore','rape','xnxx','xvideos','pornhub',
];

async function notifyAdmin(message: string) {
  try {
    await db();
    await Notification.create({ recipientEmail: SUPER_ADMIN_EMAIL, message, type: 'warning' });
  } catch (e) {
    console.error('Failed to notify admin', e);
  }
}

async function bufferToStream(buffer: Buffer) {
  const readable = new stream.PassThrough();
  readable.end(buffer);
  return readable;
}

export async function POST(req: Request) {
  try {
    // Read raw body as ArrayBuffer
    const arrayBuffer = await req.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    const filename = req.headers.get('x-filename') || `upload-${Date.now()}`;
    const mimetype = req.headers.get('x-mimetype') || 'application/octet-stream';

    // Basic content scan (first 512KB) for banned keywords
    const sample = buf.subarray(0, 512_000).toString('utf8').toLowerCase();
    const hit = BANNED_KEYWORDS.find((w) => sample.includes(w));
    if (hit) {
      await notifyAdmin(`Blocked upload containing banned content: keyword "${hit}" in file ${filename}`);
      return NextResponse.json(
        { success: false, message: 'Upload blocked due to inappropriate content.' },
        { status: 400 }
      );
    }

    // OAuth2 authentication with refresh token
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({ 
        success: false, 
        message: 'Google Drive OAuth credentials not configured. Need GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env' 
      }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Upload file
    const mediaStream = await bufferToStream(buf);

    const createRes = await drive.files.create({
      requestBody: {
        name: filename,
        parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined,
      },
      media: {
        mimeType: mimetype,
        body: mediaStream as any,
      },
      fields: 'id,webViewLink,webContentLink',
      supportsAllDrives: true, // Support for Shared Drives
    });

    const fileId = createRes.data.id;
    if (!fileId) {
      return NextResponse.json({ success: false, message: 'Failed to get uploaded file id' }, { status: 500 });
    }

    // Make file publicly readable (optional - keep as before when using GAS)
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        supportsAllDrives: true, // Support for Shared Drives
      });
    } catch (permErr) {
      // Not fatal; continue and return link
      console.warn('Permission set failed', permErr);
    }

    // Retrieve file metadata to get webViewLink
    const meta = await drive.files.get({ 
      fileId, 
      fields: 'id,webViewLink,webContentLink',
      supportsAllDrives: true, // Support for Shared Drives
    });

    const driveUrl = meta.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    return NextResponse.json({ success: true, driveUrl });
  } catch (err: any) {
    console.error('drive-upload error:', err);
    return NextResponse.json({ success: false, message: err?.message || String(err) }, { status: 500 });
  }
}
