import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Files from "@/lib/models/Files";
import { fetchAICompletion, cleanAIText } from "@/lib/ai";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await dbConnect();
  const file = await Files.findById(id);

  if (!file) {
    return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
  }

  // If summary already exists, return it
  if (file.aiSummary) {
    return NextResponse.json({ success: true, summary: file.aiSummary });
  }

  // Generate summary
  try {
    const prompt = `Summarize the following file metadata and user comments into a concise, helpful summary for a student looking for this resource.
    
Requirements:
- Format: Bullet points (plain text, use "•").
- Length: 6-10 lines total.
- Content: Focus on key topics covered, difficulty level (if inferred), and usefulness.
- Style: Informative and student-friendly.

Title: ${file.title}
Subject: ${file.subject}
Semester: ${file.semester}
Hints/Notes: ${file.hints}
Comments: ${file.comments.map((c: any) => c.text).join(" | ")}`;

    const summaryRaw = await fetchAICompletion([
      { role: "system", content: "You are a helpful assistant summarizing educational resources." },
      { role: "user", content: prompt },
    ], 300);

    const summary = cleanAIText(summaryRaw);

    // Save summary to DB
    file.aiSummary = summary;
    await file.save();

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("AI Summary Error:", error);
    return NextResponse.json({ success: false, message: "Failed to generate summary" }, { status: 500 });
  }
}
