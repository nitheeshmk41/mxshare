import { NextResponse } from "next/server";
import Files from "@/lib/models/Files";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

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

    // try to get user from session
    let uploaderName = "Anonymous";
    let uploaderEmail = "";
    try {
      const session = await getServerSession(authConfig as any);
      const email = (session as any)?.user?.email as string | undefined;
      if (email) {
        uploaderEmail = email;
        // if email like local@domain, take local part as author
        uploaderName = email.split("@")[0] || email;
      }
    } catch (e) {
      // ignore session errors
    }

    // Parse resource links
    const resourceLinks: string[] = [];
    if (body.resourceLinks && typeof body.resourceLinks === "string") {
      const links = body.resourceLinks
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean);
      resourceLinks.push(...links);
    }

    const doc = {
      title: body.title.trim(),
      subject: body.subject?.trim() || "",
      semester: body.semester?.trim() || "",
      hints: body.hints?.trim() || "",
      driveUrl: body.driveUrl.trim(),
      author: uploaderName,
      authorEmail: uploaderEmail,
      downloads: 0,
      resourceLinks,
      aiDescription: body.hints?.trim() || "",
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
