# MXShare - File Sharing Platform

A modern file sharing platform built with Next.js, featuring direct Google Drive integration, AI-powered descriptions, and real-time uploads.

## Features

- 🚀 **Direct Google Drive Upload** - Upload files directly to Google Drive from Next.js (no Google Apps Script needed)
- 📊 **Real-time Progress** - See upload progress with live feedback
- 🤖 **AI Descriptions** - Generate descriptions using AI
- 🔒 **Secure Authentication** - NextAuth with Google OAuth
- 📝 **Content Validation** - Automatic blocking of inappropriate content
- 💬 **Comments & Ratings** - Users can comment and rate files
- 📈 **Analytics** - Track views, downloads, and file statistics
- 🎨 **Modern UI** - Clean, responsive design with dark mode

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Google Cloud Console project with Drive API enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nitheeshmk41/mxnotes.git
cd mxshare
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see `.env` file):
   - MongoDB connection
   - Google OAuth credentials
   - Google Drive API credentials (see `GOOGLE_DRIVE_SETUP.md`)
   - OpenRouter API key for AI features

4. Configure Google Drive authentication:
   - Follow instructions in `GOOGLE_DRIVE_SETUP.md`
   - Option 1: Service Account (recommended)
   - Option 2: OAuth refresh token (use `node scripts/generate-refresh-token.js`)

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
