import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Reports from "@/lib/models/Reports";
import Files from "@/lib/models/Files";
import { sendAdminEmail } from "@/lib/mail";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig as any);
  if (!session || !(session as any).user?.email) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { reason } = await req.json();

  if (!reason) {
    return NextResponse.json({ success: false, message: "Reason is required" }, { status: 400 });
  }

  await dbConnect();

  const file = await Files.findById(id);
  if (!file) {
    return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
  }

  const report = await Reports.create({
    fileId: id,
    reporter: (session as any).user.email,
    reason,
  });

  // Send email to admin
  await sendAdminEmail(
    `New File Report: ${file.title}`,
    `User ${(session as any).user.email} reported file "${file.title}" (ID: ${id}).\nReason: ${reason}\n\nCheck admin dashboard.`
  );

  return NextResponse.json({ success: true, data: report });
}
