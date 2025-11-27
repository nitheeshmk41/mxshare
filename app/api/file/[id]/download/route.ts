import { NextResponse } from "next/server";
import db from "@/lib/db";
import Files from "@/lib/models/Files";

export async function POST(req: Request, context: any) {
  try {
    // read params id before any awaits to satisfy Next.js sync-dynamic-apis
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;

    await db();

    if (id) {
      await Files.findByIdAndUpdate(id, {
        $inc: { downloads: 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
