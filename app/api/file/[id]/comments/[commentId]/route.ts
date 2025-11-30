import { NextResponse } from "next/server";
import db from "@/lib/db";
import FileComments from "@/lib/models/Comments";
import Files from "@/lib/models/Files";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function DELETE(_req: Request, context: any) {
  try {
    const rawParams = context?.params;
    const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
    const id: string | undefined = params?.id;
    const commentId: string | undefined = params?.commentId;

    if (!id || !commentId) return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });

    await db();

    const comment = await FileComments.findById(commentId).lean();
    if (!comment) return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });

    const session = await getServerSession(authConfig as any);
    const sessionEmail = (session as any)?.user?.email as string | undefined;
    const sessionLocal = sessionEmail ? sessionEmail.split("@")[0] : undefined;

    // allow deletion if session local matches comment.author OR session email matches file authorEmail
    const file = await Files.findById(id).lean();

    const allowed = (sessionLocal && sessionLocal === comment.author) || (sessionEmail && file && sessionEmail === (file as any).authorEmail);
    if (!allowed) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    await FileComments.findByIdAndDelete(commentId);

    const comments = await FileComments.find({ fileId: id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: comments } as any);
  } catch (err: any) {
    console.error("DELETE /api/file/[id]/comments/[commentId] error:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
