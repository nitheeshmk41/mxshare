import { NextResponse } from "next/server";
import { fetchAICompletion } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { subject, title } = await req.json();

    if (!subject) {
      return NextResponse.json({ success: false, message: "Subject required" }, { status: 400 });
    }

    const prompt = `Generate a concise description for educational notes about "${subject}"${title ? ` with the title "${title}"` : ''}.
Requirements:
- Length: Strictly 3-4 lines.
- Format: Plain text (no markdown, no bullet points).
- Style: Informative and student-friendly.`;

    const description = await fetchAICompletion([
      { role: "user", content: prompt }
    ], 150);

    return NextResponse.json({ success: true, description });
  } catch (error: any) {
    console.error("Generate description error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}
