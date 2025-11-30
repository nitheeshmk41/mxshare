/**
 * Test script to verify Google Drive Service Account access
 * Run this to ensure your setup is correct before testing uploads
 * 
 * Usage: node scripts/test-drive-access.js
 */

const { google } = require('googleapis');
require('dotenv').config();

async function testDriveAccess() {
  console.log('\n=== Testing Google Drive Service Account Access ===\n');

  // Check if service account key exists
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY is not set in .env');
    process.exit(1);
  }

  // Parse the credentials
  let credentials;
  try {
    credentials = JSON.parse(serviceAccountKey);
    console.log('✅ Service account key parsed successfully');
    console.log(`   Email: ${credentials.client_email}`);
    console.log(`   Project: ${credentials.project_id}\n`);
  } catch (err) {
    console.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', err.message);
    console.error('   Make sure the JSON is valid and on a single line\n');
    process.exit(1);
  }

  // Create auth client
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Test 1: Check if we can access the API
  console.log('🔍 Testing API access...');
  try {
    const aboutRes = await drive.about.get({ fields: 'user' });
    console.log('✅ Can access Google Drive API');
    console.log(`   Authenticated as: ${aboutRes.data.user?.emailAddress || 'Service Account'}\n`);
  } catch (err) {
    console.error('❌ Cannot access Google Drive API:', err.message);
    console.error('   Make sure Google Drive API is enabled in Google Cloud Console\n');
    process.exit(1);
  }

  // Test 2: Check folder access (if folder ID is provided)
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (folderId) {
    console.log(`🔍 Testing access to folder: ${folderId}`);
    try {
      const folderRes = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,capabilities',
      });
      
      console.log('✅ Can access the folder');
      console.log(`   Folder name: ${folderRes.data.name}`);
      
      if (folderRes.data.capabilities?.canAddChildren) {
        console.log('✅ Can upload files to this folder\n');
      } else {
        console.error('❌ Cannot upload files to this folder');
        console.error('   Make sure you shared the folder with:', credentials.client_email);
        console.error('   And gave it "Editor" permissions\n');
        process.exit(1);
      }
    } catch (err) {
      console.error('❌ Cannot access the folder:', err.message);
      console.error('\n   📝 How to fix:');
      console.error('   1. Go to https://drive.google.com/');
      console.error('   2. Find the folder with ID:', folderId);
      console.error('   3. Right-click → Share');
      console.error(`   4. Add this email: ${credentials.client_email}`);
      console.error('   5. Give it "Editor" access\n');
      process.exit(1);
    }
  } else {
    console.log('ℹ️  No GOOGLE_DRIVE_FOLDER_ID set (uploads will go to root)\n');
  }

  // Test 3: Try creating a test file
  console.log('🔍 Testing file upload...');
  try {
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const bufferStream = require('stream').Readable.from([Buffer.from(testContent)]);
    
    const fileRes = await drive.files.create({
      requestBody: {
        name: `test-${Date.now()}.txt`,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: 'text/plain',
        body: bufferStream,
      },
      fields: 'id,name,webViewLink',
    });

    console.log('✅ Successfully created test file!');
    console.log(`   File name: ${fileRes.data.name}`);
    console.log(`   File ID: ${fileRes.data.id}`);
    console.log(`   Link: ${fileRes.data.webViewLink}\n`);

    // Clean up - delete the test file
    console.log('🧹 Cleaning up test file...');
    await drive.files.delete({ fileId: fileRes.data.id });
    console.log('✅ Test file deleted\n');

  } catch (err) {
    console.error('❌ Failed to upload test file:', err.message);
    console.error('   Error details:', err);
    process.exit(1);
  }

  console.log('🎉 All tests passed! Your setup is ready to go!\n');
  console.log('Next steps:');
  console.log('  1. Start your dev server: npm run dev');
  console.log('  2. Go to http://localhost:3000/upload');
  console.log('  3. Try uploading a file\n');
}

testDriveAccess().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
