import { analyzeValidatedPetPhoto } from "@/lib/ai/visionProvider";
import { buildRiskSummary } from "@/lib/ai/riskEngine";
import { analysisResultSchema, type AnalysisResult } from "@/lib/validation/schemas";

export type SkinAnalysisInput = {
  species: "Dog" | "Cat";
  image: File;
};

export async function analyzePetSkin(input: SkinAnalysisInput): Promise<AnalysisResult> {
  const result = await analyzeValidatedPetPhoto(input.image, input.species);
  const parsed = analysisResultSchema.safeParse(result);
  if (!parsed.success) throw new Error("AI output did not pass schema validation.");
  return buildRiskSummary(parsed.data);
}
