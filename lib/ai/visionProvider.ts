import { analysisResultSchema, type AnalysisResult } from "@/lib/validation/schemas";

export async function callVisionApi(image: File): Promise<AnalysisResult> {
  void image;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const defaultResult: AnalysisResult = {
    overallRisk: "YELLOW",
    confidence: 0.78,
    imageQuality: "GOOD",
    visibleIndicators: [
      {
        code: "DRYNESS",
        label: "Possible dryness",
        severity: "MILD",
        confidence: 0.74,
      },
      {
        code: "SCALING",
        label: "Scaling",
        severity: "MILD",
        confidence: 0.7,
      },
    ],
    summary: "Visible skin indicators suggest mild dryness and scaling.",
    recommendations: ["Monitor the area.", "Maintain grooming."],
    veterinaryAdvice: false,
    disclaimer: "This is an AI preliminary screening and not a veterinary diagnosis.",
  };

  const parsed = analysisResultSchema.safeParse(defaultResult);
  if (!parsed.success) {
    throw new Error("Invalid AI response schema");
  }

  return parsed.data;
}
