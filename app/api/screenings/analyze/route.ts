import { NextResponse } from "next/server";
import { getMockAnalysisResult } from "@/lib/ai/mockProvider";
import { analysisResultSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scenario = body?.scenario || "YELLOW";
    const result = getMockAnalysisResult(scenario);
    const parsed = analysisResultSchema.safeParse(result);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "AI response was invalid." }, { status: 400 });
    }

    return NextResponse.json({ success: true, result: parsed.data });
  } catch {
    return NextResponse.json({ success: false, message: "We couldn't analyze this image. Please try another clear photo." }, { status: 500 });
  }
}
