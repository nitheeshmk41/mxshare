import { NextResponse } from "next/server";
import db from "@/lib/db";
import Files from "@/lib/models/Files";

interface FileDoc {
  _id?: string;
  title?: string;
  subject?: string;
  semester?: string | number;
  hints?: string;
  driveUrl?: string;
  downloads?: number;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request, context: any) {
  try {
    // Resolve params early (may be a Promise in some Next versions)
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;

    await db();

    let file = null as FileDoc | null;

    // If id looks like a Mongo ObjectId, try findById first, otherwise skip
    if (id) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isObjectId) {
        file = (await Files.findById(id).lean()) as FileDoc | null;
      }

      // Fallbacks: try several fields that might match the provided id.
      // This covers use-cases where the route param is a title, a driveUrl,
      // or a partial identifier. Use cautious queries to avoid CastErrors.
      if (!file) {
        // exact title
        file = (await Files.findOne({ title: id }).lean()) as FileDoc | null;
      }

      if (!file) {
        // case-insensitive title match
        file = (await Files.findOne({ title: { $regex: `^${escapeRegex(id)}$`, $options: "i" } }).lean()) as FileDoc | null;
      }

      if (!file) {
        // driveUrl contains id (useful if id is a drive url or id)
        file = (await Files.findOne({ driveUrl: { $regex: escapeRegex(id), $options: "i" } }).lean()) as FileDoc | null;
      }
    }

    if (!file) {
      return NextResponse.json({ success: false, message: "Not found" } as ApiResponse<null>, { status: 404 });
    }

    return NextResponse.json({ success: true, data: file } as ApiResponse<FileDoc>);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import Users from "@/lib/models/User";
import Notification from "@/lib/models/Notification";

const ADMIN_EMAIL = process.env.ALERT_ADMIN_EMAIL || "25mx336@psgtech.ac.in";
const BANNED_KEYWORDS = ["sex", "porn", "xxx", "18+", "nsfw", "nude", "erotic", "adult", "hardcore", "rape"];
const BANNED_DOMAINS = ["xnxx", "xvideos", "pornhub", "redtube", "xhamster", "onlyfans", "brazzers", "porn"];

function containsBanned(text: string) {
  const lower = text.toLowerCase();
  return BANNED_KEYWORDS.some((word) => lower.includes(word));
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

async function sendNotification(recipientEmail: string, message: string, type: "warning" | "info" = "info") {
  if (!recipientEmail) return;
  try {
    await Notification.create({ recipientEmail, message, type });
  } catch (err) {
    console.error("Notification error", err);
  }
}

function ensureHttp(link: string) {
  return /^https?:\/\//i.test(link);
}

function buildLinkArray(linkInput: any) {
  if (!linkInput) return [] as string[];
  if (Array.isArray(linkInput)) return linkInput.map((l) => String(l).trim()).filter(Boolean);
  if (typeof linkInput === "string") {
    return linkInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }
  return [] as string[];
}

function validateLinks(links: string[]) {
  for (const link of links) {
    if (!ensureHttp(link)) {
      return "Each link must start with http:// or https://";
    }
  }
  return null;
}

export async function DELETE(req: Request, context: any) {
  try {
    const session = await getServerSession(authConfig as any);
    const userRole = (session as any)?.user?.role;
    const userEmail = (session as any)?.user?.email as string | undefined;
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;

    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await db();
    const file = await Files.findById(id);
    if (!file) {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
    }

    const ownerEmail = (file as any).authorEmail || (file as any).userEmail || "";

    const isOwner = ownerEmail && ownerEmail === userEmail;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Handle User Warning & Blocking
    if (isAdmin && ownerEmail) {
      const user = await Users.findOne({ email: ownerEmail });
      if (user) {
        user.warnings = (user.warnings || 0) + 1;

        let notifMessage = `Admin removed your file "${file.title}". Warning ${user.warnings}/3.`;

        if (user.warnings >= 3) {
          const blockDays = 5;
          const blockUntil = new Date();
          blockUntil.setDate(blockUntil.getDate() + blockDays);
          user.blockedUntil = blockUntil;
          user.warnings = 0; // reset for next cycle
          notifMessage += ` You have been blocked for ${blockDays} days due to multiple violations.`;
        }

        await user.save();
        await sendNotification(ownerEmail, notifMessage, "warning");
      }
    }

    await Files.findByIdAndDelete(id);

    const selfDeleteMessage = `Your file "${file.title}" was deleted${isAdmin ? " by an admin" : ""}.`;
    if (ownerEmail) {
      await sendNotification(ownerEmail, selfDeleteMessage, isAdmin ? "warning" : "info");
    }

    return NextResponse.json({ success: true, message: "File deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const session = await getServerSession(authConfig as any);
    const userEmail = (session as any)?.user?.email as string | undefined;
    if (!session || !userEmail) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await db();
    const file = await Files.findById(id);
    if (!file) return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });

    const ownerEmail = (file as any).authorEmail || (file as any).userEmail || "";
    if (ownerEmail !== userEmail) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updates: Record<string, any> = {};

    if (typeof body.title === "string") {
      const trimmed = body.title.trim();
      if (!trimmed) return NextResponse.json({ success: false, message: "Title cannot be empty" }, { status: 400 });
      updates.title = trimmed;
    }

    if (typeof body.driveUrl === "string") {
      const trimmed = body.driveUrl.trim();
      if (!ensureHttp(trimmed)) {
        return NextResponse.json({ success: false, message: "Drive link must start with http:// or https://" }, { status: 400 });
      }
      updates.driveUrl = trimmed;
    }

    const links = buildLinkArray(body.resourceLinks);
    if (links.length) {
      const err = validateLinks(links);
      if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });
      for (const link of links) {
        if (containsBanned(link) || isBannedDomain(link)) {
          await sendNotification(ADMIN_EMAIL, `Blocked edit with 18+ link on file ${file.title}`);
          return NextResponse.json({ success: false, message: "Resource link blocked due to 18+ content." }, { status: 400 });
        }
        if (file.subject) {
          const subj = String(file.subject).toLowerCase();
          if (!link.toLowerCase().includes(subj)) {
            return NextResponse.json({ success: false, message: "One or more links appear off-topic for the selected subject." }, { status: 400 });
          }
        }
      }
      updates.resourceLinks = links;
    }

    // Content safety check across updated fields
    const textBlob = [updates.title, updates.driveUrl, links.join(" ")].filter(Boolean).join(" ");
    if (textBlob && containsBanned(textBlob)) {
      await sendNotification(ADMIN_EMAIL, `Blocked edit with banned content on file ${file.title}`);
      return NextResponse.json({ success: false, message: "Update blocked due to inappropriate content." }, { status: 400 });
    }

    Object.assign(file, updates);
    await file.save();

    await sendNotification(ownerEmail, `Your file "${file.title}" details were updated successfully.`, "info");

    return NextResponse.json({ success: true, data: file });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
