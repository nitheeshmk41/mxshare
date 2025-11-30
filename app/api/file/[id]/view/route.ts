import { NextResponse } from "next/server";
import db from "@/lib/db";
import Files from "@/lib/models/Files";

export async function POST(_req: Request, context: any) {
  try {
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;

    if (!id) return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });

    await db();

    await Files.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/file/[id]/view error:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
