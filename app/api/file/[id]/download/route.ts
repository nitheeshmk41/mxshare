import { NextResponse } from "next/server";
import db from "@/lib/db";
import Files from "@/lib/models/Files";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function POST(req: Request, context: any) {
  try {
    // read params id before any awaits to satisfy Next.js sync-dynamic-apis
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;

    await db();

    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    // require logged in user
    const session = await getServerSession(authConfig as any);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // only count once per session is handled client-side via sessionStorage; server just increments
    await Files.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
