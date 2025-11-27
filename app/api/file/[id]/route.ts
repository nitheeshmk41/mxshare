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
