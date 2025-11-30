import { NextResponse } from "next/server";
import db from "@/lib/db";
import Files from "@/lib/models/Files";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await db();
    const session = await getServerSession(authConfig as any);
    const email = (session as any)?.user?.email;

    if (!email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const files = await Files.find({ authorEmail: email }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: files });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
