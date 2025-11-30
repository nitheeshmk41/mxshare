import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Reports from "@/lib/models/Reports";

const ADMIN_EMAIL = "25mx336@psgtech.ac.in";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  await dbConnect();
  // Populate file details
  const reports = await Reports.find({ status: "pending" }).populate("fileId").sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: reports });
}
