import { NextResponse } from "next/server";
import db from "@/lib/db";
import Users from "@/lib/models/User";

export async function GET() {
  await db();

  // dynamic import so bundler doesn't attempt to resolve at build-time incorrectly
  const mod = await import('@/lib/models/Files');
  const Files = (mod && (mod as any).default) || (mod as any);

  const [fileCount, userCount, stats] = await Promise.all([
    Files.countDocuments(),
    Users.countDocuments(),
    Files.aggregate([
      { 
        $group: { 
          _id: null, 
          totalDownloads: { $sum: "$downloads" },
          totalViews: { $sum: "$views" }
        } 
      }
    ])
  ]);

  // Get top performers (most views + downloads weighted)
  // We'll just sort by views for now as a simple metric
  const topFiles = await Files.find({})
    .sort({ views: -1, downloads: -1 })
    .limit(3)
    .select("title subject semester views downloads ratings author authorEmail")
    .lean();

  return NextResponse.json({
    fileCount,
    userCount,
    totalDownloads: stats[0]?.totalDownloads || 0,
    totalViews: stats[0]?.totalViews || 0,
    topFiles
  });
}
