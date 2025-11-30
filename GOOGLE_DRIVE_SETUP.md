# Google Drive Setup Guide (Service Account - Simple Method!)# Google Drive Upload Setup Guide



This guide walks you through setting up Google Drive integration using a **Service Account** for direct file uploads from Next.js. This is **much simpler** than OAuth because you don't need to generate refresh tokens manually!This guide will help you set up direct Google Drive uploads from your Next.js application using the Google Drive API (no Apps Script required).



## Why Service Account?## Overview



✅ **No manual token generation** - just download one JSON file  The application now uploads files directly to Google Drive using:

✅ **Never expires** - no need to refresh tokens  - **Google Drive API v3** via the `googleapis` npm package

✅ **Simpler setup** - fewer steps  - **OAuth 2.0** with a refresh token for server-side authentication

✅ **Perfect for server-to-server** - ideal for Next.js API routes  - **Next.js API Route** (`/api/drive-upload`) that handles the upload



## Step-by-Step Setup (5 minutes)## Prerequisites



### 1. Create/Access Google Cloud Project- A Google Cloud Project

- Google Drive API enabled

1. Go to [Google Cloud Console](https://console.cloud.google.com/)- OAuth 2.0 credentials (Client ID and Client Secret)

2. Create a new project or select an existing one

3. Note your project name## Step-by-Step Setup



### 2. Enable Google Drive API### 1. Create a Google Cloud Project



1. In the Cloud Console, go to **APIs & Services** → **Library**1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Search for "Google Drive API"2. Click **Select a project** → **New Project**

3. Click **Enable**3. Enter a project name (e.g., "MXShare Upload")

4. Click **Create**

### 3. Create a Service Account

### 2. Enable Google Drive API

1. Go to **IAM & Admin** → **Service Accounts**

2. Click **Create Service Account**1. In your project, go to **APIs & Services** → **Library**

3. Fill in:2. Search for "Google Drive API"

   - **Service account name**: `mxshare-drive-uploader` (or any name)3. Click on it and press **Enable**

   - **Service account description**: `Service account for uploading files to Google Drive`

4. Click **Create and Continue**### 3. Configure OAuth Consent Screen (IMPORTANT!)

5. Skip "Grant this service account access to project" (click Continue)

6. Skip "Grant users access to this service account" (click Done)1. Go to **APIs & Services** → **OAuth consent screen**

2. Choose User Type:

### 4. Create and Download Service Account Key   - **External** (if you want to use this with any Google account)

   - Or **Internal** (if using Google Workspace and only for your organization)

1. Find your newly created service account in the list3. Fill in the required fields:

2. Click on it to open details   - App name: `MXShare` (or your app name)

3. Go to the **Keys** tab   - User support email: Your email

4. Click **Add Key** → **Create new key**   - Developer contact: Your email

5. Choose **JSON** format4. Click **Save and Continue**

6. Click **Create**5. **Add Scopes**:

7. A JSON file will download automatically - **keep it safe!**   - Click **Add or Remove Scopes**

   - Search for and add: `https://www.googleapis.com/auth/drive.file`

The downloaded file looks like this:   - This allows the app to create and modify files it creates

```json   - Click **Update** then **Save and Continue**

{6. **Add Test Users** (CRITICAL for development):

  "type": "service_account",   - Click **Add Users**

  "project_id": "your-project",   - Add your Google account email (the one you'll use for uploads)

  "private_key_id": "...",   - Click **Add** then **Save and Continue**

  "private_key": "-----BEGIN PRIVATE KEY-----\n...",7. Click **Back to Dashboard**

  "client_email": "mxshare-drive-uploader@your-project.iam.gserviceaccount.com",

  "client_id": "...",> ⚠️ **Important**: While your app is in "Testing" mode, only test users you added can authorize it. This is why you're getting the "access denied" error!

  "auth_uri": "https://accounts.google.com/o/oauth2/auth",

  "token_uri": "https://oauth2.googleapis.com/token",### 4. Create OAuth 2.0 Credentials

  ...

}1. Go to **APIs & Services** → **Credentials**

```2. Click **Create Credentials** → **OAuth client ID**

3. Configure:

### 5. Add Service Account Key to .env   - Application type: **Desktop app** (not Web application!)

   - Name: "MXShare Desktop Client"

1. Open the downloaded JSON file4. Click **Create**

2. Copy the **ENTIRE contents** (all of it, exactly as is)5. **Save the Client ID and Client Secret** that appear

3. Open your `.env` file

4. Paste it as one line for `GOOGLE_SERVICE_ACCOUNT_KEY`:### 5. Generate a Refresh Token



```envThe application includes a helper script to generate your refresh token.

GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}

```1. **Add your credentials to `.env`**:

   ```bash

**Important:** The entire JSON should be on one line. If you need to format it, you can also escape it:   GOOGLE_CLIENT_ID=your-client-id-here

```env   GOOGLE_CLIENT_SECRET=your-client-secret-here

GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'   ```

```

2. **Run the refresh token generator**:

### 6. Give Service Account Access to Your Drive Folder   ```bash

   node scripts/generate-refresh-token.js

This is the **crucial step** that many people miss!   ```



1. Go to [Google Drive](https://drive.google.com/)3. **Follow the prompts**:

2. Create a folder for uploads (e.g., "MXShare Uploads") or use an existing one   - Copy the URL that appears

3. **Right-click** the folder → **Share**   - Open it in your browser

4. In the "Add people" field, paste the **service account email** from the JSON file   - **Sign in with the Google account you added as a test user** (important!)

   - It looks like: `mxshare-drive-uploader@your-project.iam.gserviceaccount.com`   - Grant permissions to access Google Drive

   - You can find it in the JSON as `"client_email"`   - Google will display an authorization code on the screen

5. Give it **Editor** access   - Copy the authorization code

6. Click **Share** (you might see a warning that it's not a regular Gmail - that's OK!)   - Paste it into the terminal and press Enter

7. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

8. Add it to `.env`:4. **The script will output your refresh token**. Copy it immediately!

   ```env

   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here5. **Add the refresh token to `.env`**:

   ```   ```bash

   GOOGLE_REFRESH_TOKEN=your-refresh-token-here

### 7. Your Final .env File   ```



```env> 💡 **Troubleshooting**: If you get "access denied" errors:

# Google Drive Service Account> - Make sure you added your email as a test user in the OAuth consent screen

GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}> - Make sure you're using a **Desktop app** OAuth client (not Web application)

> - Try signing out of Google and signing in again with the test user account

# Folder where uploads will go (must share this folder with the service account email!)

GOOGLE_DRIVE_FOLDER_ID=1YlUouqhP8nRXmUKuUcNZ2L0ymK_b8a0x### 6. (Optional) Create a Dedicated Drive Folder



# ... other environment variables ...To organize uploads in a specific folder:

```

1. Go to [Google Drive](https://drive.google.com/)

### 8. Test the Upload2. Create a new folder (e.g., "MXShare Uploads")

3. Open the folder and copy the ID from the URL:

1. Start your development server:   ```

   ```bash   https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J

   npm run dev                                          ^^^^^^^^^^^^^^^^^^^^

   ```                                          This is the Folder ID

   ```

2. Navigate to `http://localhost:3000/upload`4. Add it to `.env`:

   ```bash

3. Click "Upload to Google Drive"   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here

   ```

4. Select a test file

If you skip this step, files will be uploaded to the root of "My Drive".

5. Verify:

   - ✅ Upload completes successfully### 7. Verify Your `.env` File

   - ✅ "Google Drive Link" field is populated

   - ✅ File appears in your Google Drive folderYour `.env` should now contain these Google Drive variables:



## Troubleshooting```bash

# Google Drive API Configuration

### "GOOGLE_SERVICE_ACCOUNT_KEY is not configured"GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456

**Solution:** Make sure you copied the entire JSON file contents to your `.env` file.GOOGLE_REFRESH_TOKEN=1//0abc123def456...

GOOGLE_DRIVE_FOLDER_ID=1A2B3C4D5E6F7G8H9I0J  # Optional

### "Invalid GOOGLE_SERVICE_ACCOUNT_KEY format"

# Other app configuration

**Solution:** The JSON might be malformed. Make sure:NEXTAUTH_SECRET=...

- You copied the complete JSON (including opening `{` and closing `}`)MONGODB_URI=...

- No line breaks in the middle of the JSON stringALLOWED_DOMAIN=...

- Or wrap it in single quotes: `GOOGLE_SERVICE_ACCOUNT_KEY='{ ... }'`URL=http://localhost:3000

OPENROUTER_API_KEY=...

### "insufficientPermissions" or "File not found"```



**Solution:** You forgot to share the folder with the service account!## Testing the Upload

1. Open the folder in Google Drive

2. Click Share1. Start your development server:

3. Add the service account email (from `client_email` in the JSON)   ```bash

4. Give it Editor access   npm run dev

   ```

### Upload succeeds but file doesn't appear

2. Navigate to `http://localhost:3000/upload`

**Solution:** Check the folder ID is correct, or remove `GOOGLE_DRIVE_FOLDER_ID` temporarily to upload to the service account's root folder.

3. Click **"Upload to Google Drive"**

### "The caller does not have permission"

4. Select a file from your computer

**Solution:** 

1. Make sure the Google Drive API is enabled in your project5. Wait for the upload to complete (you'll see "✓ Uploaded to Drive")

2. Share the destination folder with the service account email

3. Give the service account at least "Editor" permissions6. The Google Drive Link field should auto-populate



## Security Notes7. Fill in the remaining form fields and click **"Save to Database"**



- **Never commit `.env` to version control** - it contains your private key!## How It Works

- Add `.env` to your `.gitignore` file

- The service account key gives full access to any folder shared with it### Upload Flow

- Store the downloaded JSON file securely (you can delete it after adding to `.env`)

- For production, use environment variables on your hosting platform (Vercel, Railway, etc.)1. **Client** (`app/upload/page.tsx`):

   - User clicks "Upload to Google Drive"

## Production Deployment   - Native file picker opens

   - Selected file is sent as raw body to `/api/drive-upload`

When deploying to production (Vercel, Railway, etc.):   - Headers include filename, size, and MIME type



1. Go to your hosting platform's environment variables settings2. **Server** (`app/api/drive-upload/route.ts`):

2. Add `GOOGLE_SERVICE_ACCOUNT_KEY` with the full JSON contents   - Reads the file from request body

3. Add `GOOGLE_DRIVE_FOLDER_ID` with your folder ID   - Creates OAuth2 client with refresh token

4. Make sure the production folder is also shared with the service account!   - Uploads file to Google Drive using `googleapis`

   - Sets file permissions to "anyone with link can view"

## Comparison: Service Account vs OAuth   - Returns the public Drive URL



| Feature | Service Account (Current) | OAuth Refresh Token (Old) |3. **Client** (continued):

|---------|--------------------------|---------------------------|   - Receives Drive URL from API

| Setup complexity | ⭐ Simple | ⭐⭐⭐ Complex |   - Auto-fills the "Google Drive Link" field

| Token expiration | ✅ Never | ❌ Can expire |   - Shows success notification

| Manual steps | 1 (download JSON) | 3+ (authorize, copy code, etc.) |

| Maintenance | ✅ None | ❌ Regenerate tokens periodically |### File Permissions

| Best for | Server apps | User apps |

By default, uploaded files are set to **"anyone with the link can view"**. This means:

## Additional Resources- ✅ Files are not publicly listed

- ✅ Only people with the direct link can access them

- [Google Service Accounts Documentation](https://cloud.google.com/iam/docs/service-accounts)- ✅ No sign-in required to view

- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)

- [Service Account Keys Best Practices](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)If you want to change this behavior, edit `app/api/drive-upload/route.ts` and modify or remove the permission setting.


## Troubleshooting

### Error: "Google Drive OAuth credentials are not configured"

**Solution**: Make sure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` are set in `.env`

### Error: "invalid_grant" or "Token has been expired or revoked"

**Solution**: Your refresh token may have expired. Regenerate it:
```bash
node scripts/generate-refresh-token.js
```

### Error: "insufficient permissions"

**Solution**: 
1. Make sure you granted the correct scope when generating the token
2. The scope should be `https://www.googleapis.com/auth/drive.file`
3. If you changed scopes, regenerate the refresh token

### Upload works but file not in specified folder

**Solution**: 
1. Verify `GOOGLE_DRIVE_FOLDER_ID` is correct
2. Make sure the Google account that created the refresh token has access to that folder
3. If the folder is in a Shared Drive, additional setup may be required

### Large files fail to upload

**Possible causes**:
- Server memory limits (current implementation buffers entire file)
- Request timeout limits
- Network interruptions

**Solutions**:
- For files >50MB, consider implementing resumable uploads
- Increase Next.js server timeout if needed
- Add client-side file size validation

## Security Notes

1. **Never commit `.env` to git** - It contains sensitive credentials
2. **Refresh tokens are long-lived** - Treat them like passwords
3. **Client/Server separation** - OAuth tokens never leave the server
4. **File validation** - Consider adding server-side file type/size checks
5. **Rate limiting** - Consider adding rate limits to the upload endpoint

## Migration from Apps Script

If you previously used Google Apps Script for uploads:

### What Changed
- ❌ No more popup window
- ❌ No more `GAS_UPLOAD_URL` in `.env`
- ❌ No more `postMessage` communication
- ✅ Direct upload from Next.js
- ✅ Native file picker
- ✅ Better error handling
- ✅ No external dependencies

### Clean Up
1. Remove `GAS_UPLOAD_URL` from `.env` (already done)
2. Your old Apps Script code can be deleted or kept as backup
3. Existing file links in the database continue to work

## Advanced Configuration

### Custom Scopes

If you need additional Google Drive permissions, modify the scope in `scripts/generate-refresh-token.js`:

```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',  // Upload/manage files created by app
  // 'https://www.googleapis.com/auth/drive',    // Full drive access (use carefully!)
];
```

Then regenerate your refresh token.

### Upload to Shared Drives

To upload to a Shared Drive (formerly Team Drive):

1. Ensure your OAuth scope includes Shared Drive access
2. Modify the upload route to include `supportsAllDrives: true`
3. Use the Shared Drive folder ID in `GOOGLE_DRIVE_FOLDER_ID`

### Private Files (No Public Link)

To make files private by default, remove or comment out this section in `app/api/drive-upload/route.ts`:

```typescript
// Remove this block to keep files private
await drive.permissions.create({
  fileId,
  requestBody: {
    role: 'reader',
    type: 'anyone',
  },
});
```

## Support

For issues with:
- **Google Cloud Console**: [Google Cloud Support](https://cloud.google.com/support)
- **OAuth/Tokens**: Check [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- **Drive API**: [Google Drive API Reference](https://developers.google.com/drive/api/v3/reference)
- **This Implementation**: Create an issue in the repository

## References

- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
