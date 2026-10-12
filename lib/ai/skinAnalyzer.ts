import { getMockAnalysisResult } from "@/lib/ai/mockProvider";
import { callVisionApi } from "@/lib/ai/visionProvider";
import { analysisResultSchema, type AnalysisResult } from "@/lib/validation/schemas";

export type SkinAnalysisInput = {
  species?: string;
  petName?: string;
  image?: File | null;
  demoScenario?: "GREEN" | "YELLOW" | "RED";
};

export async function analyzePetSkin(input: SkinAnalysisInput): Promise<AnalysisResult> {
  const provider = process.env.AI_PROVIDER || "vision_api";

  if (provider === "mock" || input.demoScenario) {
    const scenario = input.demoScenario || "YELLOW";
    const result = getMockAnalysisResult(scenario);
    const parsed = analysisResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new Error("Mock AI result failed schema validation");
    }
    return parsed.data;
  }

  if (!input.image) {
    throw new Error("Image is required for AI analysis.");
  }

  const result = await callVisionApi(input.image);
  const parsed = analysisResultSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("AI output did not pass schema validation.");
  }

  return parsed.data;
}
