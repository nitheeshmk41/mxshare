import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Reports from "@/lib/models/Reports";
import Files from "@/lib/models/Files";

const ADMIN_EMAIL = "25mx336@psgtech.ac.in";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params; // Report ID
  const { action } = await req.json(); // "accept" (delete file) or "dismiss" (ignore report)

  await dbConnect();
  const report = await Reports.findById(id);
  if (!report) {
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });
  }

  if (action === "accept") {
    // Delete the file
    await Files.findByIdAndDelete(report.fileId);
    report.status = "resolved";
    await report.save();
    // Also mark other reports for this file as resolved? Or just let them be orphans?
    // Better to delete all reports for this file or mark them resolved.
    await Reports.updateMany({ fileId: report.fileId }, { status: "resolved" });
  } else if (action === "dismiss") {
    report.status = "dismissed";
    await report.save();
  } else {
    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
