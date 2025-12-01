/**
 * Helper script to generate Google OAuth2 refresh token
 * 
 * IMPORTANT: Before running this script, you MUST add BOTH redirect URIs to Google Cloud Console:
 * 
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Click on your OAuth 2.0 Client ID
 * 3. Under "Authorized redirect URIs", add BOTH:
 *    - http://localhost:3333/oauth2callback (for local development)
 *    - https://mxshare.vercel.app (for production - used as origin)
 * 4. Under "Authorized JavaScript origins", add:
 *    - http://localhost:3000
 *    - https://mxshare.vercel.app
 * 5. Click Save
 * 6. Wait a few minutes for changes to propagate
 * 
 * Usage:
 * 1. Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env
 * 2. Run: node scripts/generate-refresh-token.js
 * 3. Follow the instructions to authorize
 * 4. Copy the refresh token to .env as GOOGLE_REFRESH_TOKEN
 * 5. Add the same GOOGLE_REFRESH_TOKEN to Vercel environment variables
 */

const { google } = require('googleapis');
const http = require('http');
require('dotenv').config();

const REDIRECT_URI = 'http://localhost:3333/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('\n=== Google Drive Refresh Token Generator ===\n');
console.log('⚠️  IMPORTANT: Make sure you have added this redirect URI in Google Cloud Console:');
console.log('   http://localhost:3333/oauth2callback\n');
console.log('   Go to: https://console.cloud.google.com/apis/credentials');
console.log('   Click your OAuth 2.0 Client ID → Add to "Authorized redirect URIs"\n');
console.log('Starting local server to receive OAuth callback...\n');

// Create a local server to receive the callback
const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith('/oauth2callback')) {
    const url = new URL(req.url, 'http://localhost:3333');
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>❌ Authorization Error</h1><p>${error}</p><p>Make sure you have added http://localhost:3333/oauth2callback to your authorized redirect URIs in Google Cloud Console.</p>`);
      console.error('\n❌ Authorization error:', error);
      console.log('\nMake sure:');
      console.log('1. http://localhost:3333/oauth2callback is added to Authorized redirect URIs');
      console.log('2. Your OAuth consent screen is properly configured');
      console.log('3. Your email is added as a test user if the app is in testing mode\n');
      server.close();
      process.exit(1);
    }
    
    if (code) {
      try {
        const { tokens } = await oauth2Client.getToken(code);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>✅ Success! You can close this window.</h1><p>Check your terminal for the refresh token.</p>');
        
        console.log('\n✅ Success! Your refresh token:\n');
        console.log(tokens.refresh_token);
        console.log('\nAdd this to your .env file as:');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
        console.log('Also update this in Vercel environment variables if deploying!\n');
        
        server.close();
        process.exit(0);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>❌ Error getting token</h1><p>' + err.message + '</p>');
        console.error('Error:', err.message);
        server.close();
        process.exit(1);
      }
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3333, () => {
  console.log('STEP 1: Open this URL in your browser:\n');
  console.log(authUrl + '\n');
  console.log('STEP 2: Sign in with your Google account (use the account that owns the Drive folder)');
  console.log('STEP 3: Authorize the application');
  console.log('STEP 4: You will be redirected back automatically\n');
  console.log('Waiting for authorization...');
});
