import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { getGoogleDriveClient, DRIVE_CONFIG } from "@/lib/google-drive";
import Notification from "@/lib/models/Notification";
import db from "@/lib/db";

const SUPER_ADMIN_EMAIL = process.env.ALERT_ADMIN_EMAIL || "25mx336@psgtech.ac.in";
const BANNED_KEYWORDS = [
  "sex", "porn", "xxx", "18+", "nsfw", "nude", "erotic", "adult", "hardcore", "rape", "xnxx", "xvideos", "pornhub",
];

async function notifyAdmin(message: string) {
  try {
    await db();
    await Notification.create({
      recipientEmail: SUPER_ADMIN_EMAIL,
      message,
      type: "warning",
    });
  } catch (e) {
    console.error("Failed to notify admin", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !DRIVE_CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed: ${DRIVE_CONFIG.ALLOWED_EXTENSIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > DRIVE_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 25MB" },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const finalName = `${timestamp}_${uniqueId}_${file.name}`;

    // Convert file to buffer and stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Basic content scan (textual scan of file bytes)
    const sample = buffer.subarray(0, 512_000).toString("utf8").toLowerCase();
    const hit = BANNED_KEYWORDS.find((w) => sample.includes(w));
    if (hit) {
      await notifyAdmin(`Blocked upload containing banned content: keyword "${hit}" in file ${file.name}`);
      return NextResponse.json(
        { success: false, error: "Upload blocked due to inappropriate content." },
        { status: 400 }
      );
    }
    const stream = Readable.from(buffer);

    // Get authenticated Drive client
    const drive = getGoogleDriveClient();

    // Upload file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: finalName,
        parents: [DRIVE_CONFIG.FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const driveUrl = response.data.webViewLink || "";

    return NextResponse.json({
      success: true,
      driveUrl,
      fileId: response.data.id,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload file",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
