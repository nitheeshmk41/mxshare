import { google } from "googleapis";

/**
 * Get authenticated Google Drive client
 * 
 * Note: For production use, you should either:
 * 1. Use a Service Account (recommended for server-side)
 * 2. Implement OAuth2 flow to get refresh token
 * 
 * For Service Account approach:
 * - Create a service account in Google Cloud Console
 * - Download JSON key file
 * - Share your Drive folder with the service account email
 * - Add GOOGLE_SERVICE_ACCOUNT_JSON to .env
 */
export function getGoogleDriveClient() {
  // Check if service account credentials are available
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (serviceAccountJson) {
    // Service Account authentication (recommended)
    try {
      const credentials = JSON.parse(serviceAccountJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
      
      return google.drive({ version: "v3", auth });
    } catch (error) {
      console.error("Failed to parse service account JSON:", error);
      throw new Error("Invalid service account credentials");
    }
  }

  // Fallback: OAuth2 with refresh token
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  
  if (refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.URL || "http://localhost:3000"
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return google.drive({ version: "v3", auth: oauth2Client });
  }

  throw new Error(
    "Google Drive authentication not configured. Please set either GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_REFRESH_TOKEN in .env"
  );
}

export const DRIVE_CONFIG = {
  FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  ALLOWED_EXTENSIONS: [
    "png", "jpg", "jpeg", "gif", "pdf", "txt", "zip",
    "doc", "docx", "ppt", "pptx", "mp4", "avi", "mov"
  ],
};
