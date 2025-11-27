import { NextResponse } from "next/server";
import db from "@/lib/db";
import Files from "@/lib/models/Files";

export async function GET(req: Request) {
  try {
    await db();

    let q = "";

    // --- Safe URL Parsing ---
    try {
      const base = process.env.URL || "http://localhost:3000";
      const { searchParams } = new URL(req.url, base);
      q = (searchParams.get("q") || "").trim();
    } catch (err) {
      // Fallback parser — never throw
      try {
        const raw = String(req.url);
        const qs = raw.includes("?") ? raw.split("?")[1] : "";
        q = (new URLSearchParams(qs).get("q") || "").trim();
      } catch {
        q = "";
      }
    }

    // --- Direct lookup by _id ---
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(q);

    if (q && isObjectId) {
      const doc = await Files.findById(q).lean();
      if (doc) return NextResponse.json(doc);
    }

    // --- Title search ---
    const results = await Files.find(
      q
        ? { title: { $regex: q, $options: "i" } }
        : {} // if empty query, return latest items
    )
      .limit(20)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("/api/search error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
