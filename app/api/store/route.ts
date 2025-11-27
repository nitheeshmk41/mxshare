import { NextResponse } from "next/server";
import Files from "@/lib/models/Files";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    await db();

    const body = await req.json();

    // Validate
    if (!body || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    if (!body.driveUrl || typeof body.driveUrl !== "string") {
      return NextResponse.json(
        { success: false, message: "Drive URL is required" },
        { status: 400 }
      );
    }

    const doc = {
      title: body.title.trim(),
      subject: body.subject?.trim() || "",
      semester: body.semester?.trim() || "",
      hints: body.hints?.trim() || "",
      driveUrl: body.driveUrl.trim(),
      downloads: 0,
      createdAt: new Date(),
    };

    let saved;
    try {
      saved = await Files.create(doc);
    } catch (dbErr: any) {
      console.error("❌ DB Create Error:", dbErr);
      return NextResponse.json(
        { success: false, message: "Database save failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (err: any) {
    console.error("❌ /api/store general error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
