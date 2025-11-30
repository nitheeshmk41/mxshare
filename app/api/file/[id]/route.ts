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

const ADMIN_EMAIL = "25mx336@psgtech.ac.in";

export async function DELETE(req: Request, context: any) {
  try {
    const session = await getServerSession(authConfig as any);
    const userRole = (session as any)?.user?.role;
    
    if (!session || userRole !== "admin") {
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

    // Handle User Warning & Blocking
    if (file.userEmail) {
      const user = await Users.findOne({ email: file.userEmail });
      if (user) {
        user.warnings = (user.warnings || 0) + 1;
        
        let notifMessage = `Admin removed your file "${file.title}". Warning ${user.warnings}/3.`;
        
        if (user.warnings >= 3) {
          const blockDays = 5;
          const blockUntil = new Date();
          blockUntil.setDate(blockUntil.getDate() + blockDays);
          user.blockedUntil = blockUntil;
          user.warnings = 0; // Reset warnings after block? Or keep them? Usually reset or keep accumulating. Let's reset for this cycle.
          notifMessage += ` You have been blocked for ${blockDays} days due to multiple violations.`;
        }

        await user.save();

        // Send Notification
        await Notification.create({
          recipientEmail: file.userEmail,
          message: notifMessage,
          type: "warning"
        });
      }
    }

    await Files.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "File deleted and user warned" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
