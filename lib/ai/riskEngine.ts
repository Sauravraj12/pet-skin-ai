import type { AnalysisResult } from "@/lib/validation/schemas";

export const HIGH_RISK_RECOMMENDATIONS = [
  "Arrange a prompt examination with a licensed veterinarian.",
  "Avoid applying medication or topical products unless your veterinarian recommends them.",
];

export function buildRiskSummary(result: AnalysisResult): AnalysisResult {
  const normalized = { ...result };

  if (normalized.confidence < 0.55 || normalized.imageQuality !== "GOOD" || normalized.overallRisk === "UNABLE_TO_DETERMINE") {
    normalized.overallRisk = "UNABLE_TO_DETERMINE";
    normalized.summary = "Unable to determine — veterinary review recommended.";
    normalized.recommendations = [];
    normalized.veterinaryAdvice = true;
    return normalized;
  }

  if (normalized.overallRisk === "RED") {
    normalized.veterinaryAdvice = true;
    if (normalized.recommendations.length === 0) {
      normalized.recommendations = [...HIGH_RISK_RECOMMENDATIONS];
    }
  }

  return normalized;
}
