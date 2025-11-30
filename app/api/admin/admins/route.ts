import { NextResponse } from "next/server";
import db from "@/lib/db";
import Admins from "@/lib/models/Admins";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

const SUPER_ADMIN_EMAIL = "25mx336@psgtech.ac.in";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig as any);
    if ((session as any)?.user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await db();
    const admins = await Admins.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: admins });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig as any);
    if ((session as any)?.user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }

    await db();
    
    // Check if already exists
    const existing = await Admins.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, message: "Admin already exists" }, { status: 400 });
    }

    const newAdmin = await Admins.create({
      email,
      addedBy: (session as any)?.user?.email || "System",
    });

    return NextResponse.json({ success: true, data: newAdmin });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authConfig as any);
    const requesterEmail = (session as any)?.user?.email;
    if ((session as any)?.user?.role !== "admin" || requesterEmail !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (err) {
      body = {};
    }

    const { email } = body;
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }

    if (email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ success: false, message: "Cannot remove super admin" }, { status: 400 });
    }

    await db();
    const removed = await Admins.findOneAndDelete({ email });
    if (!removed) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: removed });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
