import { NextResponse } from "next/server";
import db from "@/lib/db";
import FileComments from "@/lib/models/Comments";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

type Comment = {
  author?: string;
  text: string;
  createdAt?: Date | string;
};

export async function GET(_req: Request, context: any) {
  try {
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;

    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    await db();

    const comments = await FileComments.find({ fileId: id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: comments } as any);
  } catch (err: any) {
    console.error("GET /api/file/[id]/comments error:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: any) {
  try {
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;

    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
  const { author: providedAuthor, text } = body as { author?: string; text?: string };

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ success: false, message: "Comment text required" }, { status: 400 });
    }

    await db();

    // prefer session user if available
    let finalAuthor = providedAuthor || "Anonymous";
    try {
      const session = await getServerSession(authConfig as any);
      const email = (session as any)?.user?.email;
      if (email && typeof email === "string") {
        finalAuthor = email.split("@")[0] || email;
      }
    } catch (e) {
      // ignore
    }

    const created = await FileComments.create({ fileId: id, author: finalAuthor, text: text.trim() });

    const comments = await FileComments.find({ fileId: id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: comments } as any);
  } catch (err: any) {
    console.error("POST /api/file/[id]/comments error:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
