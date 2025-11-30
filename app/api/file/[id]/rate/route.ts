import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Files from "@/lib/models/Files";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  if (!session || !session.user?.email) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { stars } = await req.json();

  if (!stars || stars < 1 || stars > 5) {
    return NextResponse.json({ success: false, message: "Invalid rating" }, { status: 400 });
  }

  await dbConnect();

  const file = await Files.findById(id);
  if (!file) {
    return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
  }

  // Check if user already rated
  const existingRatingIndex = file.ratings.findIndex((r: any) => r.user === session.user?.email);

  if (existingRatingIndex > -1) {
    // Update existing rating
    file.ratings[existingRatingIndex].stars = stars;
  } else {
    // Add new rating
    file.ratings.push({ user: session.user.email, stars });
  }

  await file.save();

  return NextResponse.json({ success: true, data: file.ratings });
}
