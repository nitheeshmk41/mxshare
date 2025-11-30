import { NextResponse } from "next/server";
import { fetchAICompletion } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const answer = await fetchAICompletion([
      { role: "user", content: prompt }
    ]);

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("Validate API error:", err);
    return NextResponse.json({ error: err.message || "Failed to validate" }, { status: 500 });
  }
}
