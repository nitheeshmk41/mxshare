import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  await db();

  // dynamic import so bundler doesn't attempt to resolve at build-time incorrectly
  const mod = await import('@/lib/models/Files');
  const Files = (mod && (mod as any).default) || (mod as any);

  const count = await Files.countDocuments();
  const downloads = await Files.aggregate([
    { $group: { _id: null, total: { $sum: "$downloads" } } }
  ]);

  return NextResponse.json({
    fileCount: count,
    totalDownloads: downloads[0]?.total || 0
  });
}
