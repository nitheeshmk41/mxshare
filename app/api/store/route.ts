import { NextResponse } from "next/server";
import Files from "@/lib/models/Files";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import Notification from "@/lib/models/Notification";

const SUPER_ADMIN_EMAIL = process.env.ALERT_ADMIN_EMAIL || "25mx336@psgtech.ac.in";
const BANNED_KEYWORDS = [
  "sex", "porn", "xxx", "18+", "nsfw", "nude", "erotic", "adult", "hardcore", "rape",
];
const BANNED_DOMAINS = [
  "xnxx", "xvideos", "pornhub", "redtube", "xhamster", "onlyfans", "brazzers", "porn",
];

function containsBanned(text: string) {
  const lower = text.toLowerCase();
  return BANNED_KEYWORDS.some((w) => lower.includes(w));
}

async function notifyAdmin(message: string) {
  try {
    await Notification.create({
      recipientEmail: SUPER_ADMIN_EMAIL,
      message,
      type: "warning",
    });
  } catch (e) {
    console.error("Failed to notify admin", e);
  }
}

function isBannedDomain(link: string) {
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    return BANNED_DOMAINS.some((d) => host.includes(d));
  } catch {
    return false;
  }
}

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

    // Parse resource links with validation
    const resourceLinks: string[] = [];
    if (body.resourceLinks && typeof body.resourceLinks === "string") {
      const links = body.resourceLinks
        .split("\n")
        .map((l: string) => l.trim())
        .filter(Boolean);

      for (const link of links) {
        if (!/^https?:\/\//i.test(link)) {
          return NextResponse.json(
            { success: false, message: "Each resource link must start with http:// or https://" },
            { status: 400 }
          );
        }
        resourceLinks.push(link);
      }
    }

    // Content safety check across text fields
    const textBlob = [body.title, body.subject, body.hints, body.driveUrl]
      .filter(Boolean)
      .join(" ");
    if (containsBanned(textBlob)) {
      await notifyAdmin(`Blocked 18+ content in upload: ${body.title || "untitled"}`);
      return NextResponse.json(
        { success: false, message: "Upload blocked due to inappropriate content." },
        { status: 400 }
      );
    }

    // Topic consistency check for resource links
    if (body.subject && resourceLinks.length) {
      const subj = String(body.subject).toLowerCase();
      for (const link of resourceLinks) {
        const lower = link.toLowerCase();
        if (!lower.includes(subj)) {
          return NextResponse.json(
            { success: false, message: "One or more links appear off-topic for the selected subject." },
            { status: 400 }
          );
        }
      }
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
