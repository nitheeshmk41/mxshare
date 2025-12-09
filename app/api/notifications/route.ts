import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import db from "@/lib/db";
import Notification from "@/lib/models/Notification";
import Files from "@/lib/models/Files";

export async function GET() {
  const session: any = await getServerSession(authConfig as any);
  if (!session?.user?.email) {
    return NextResponse.json({ notifications: [] });
  }

  await db();

  // 1. Fetch Personal Notifications (Warnings, etc.)
  const personal = await Notification.find({ 
    recipientEmail: session.user.email,
    read: false 
  }).sort({ createdAt: -1 }).limit(10).lean();

  // 2. Fetch "New File" Activity (Global)
  // We'll just get the last 5 files uploaded by OTHERS
  const recentFiles = await Files.find({
    authorEmail: { $ne: session.user.email } // Don't notify about own files
  })
  .sort({ createdAt: -1 })
  .limit(5)
  .select("title subject semester author authorEmail createdAt")
  .lean();

  // Transform files into notification-like objects
  const fileNotifications = recentFiles.map((f: any) => {
    const who = f.authorEmail?.split("@")[0] || f.author || "Someone";
    const subj = f.subject ? ` · ${f.subject}` : "";
    const sem = f.semester ? ` · ${f.semester}` : "";
    return {
      _id: f._id,
      type: "new_file",
      message: `${who} shared "${f.title}"${subj}${sem}`,
      createdAt: f.createdAt,
      read: false,
      link: `/file/${f._id}`,
    };
  });

  // Merge and sort
  const all = [...personal, ...fileNotifications].sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ notifications: all });
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authConfig as any);
  if (!session?.user?.email) return NextResponse.json({ success: false }, { status: 401 });

  const { id } = await req.json();
  await db();

  // Only mark personal notifications as read
  await Notification.updateOne(
    { _id: id, recipientEmail: session.user.email },
    { $set: { read: true } }
  );

  return NextResponse.json({ success: true });
}
