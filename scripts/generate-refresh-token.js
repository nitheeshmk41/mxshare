/**
 * Helper script to generate Google OAuth2 refresh token
 * 
 * Usage:
 * 1. Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env
 * 2. Run: node scripts/generate-refresh-token.js
 * 3. Follow the instructions to authorize
 * 4. Copy the refresh token to .env as GOOGLE_REFRESH_TOKEN
 */

const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'  // Use OOB (out-of-band) flow for CLI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('\n=== Google Drive Refresh Token Generator ===\n');
console.log('STEP 1: Open this URL in your browser:');
console.log('\n' + authUrl + '\n');
console.log('STEP 2: Sign in and authorize the application');
console.log('STEP 3: Google will show you an authorization code');
console.log('STEP 4: Copy that code and paste it below');
console.log('\nPaste the authorization code here: ');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    
    console.log('\n✅ Success! Your refresh token:\n');
    console.log(tokens.refresh_token);
    console.log('\nAdd this to your .env file as:');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
});
