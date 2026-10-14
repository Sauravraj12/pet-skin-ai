import type { AnalysisResult } from "@/lib/validation/schemas";

export function buildRiskSummary(result: AnalysisResult): AnalysisResult {
  const normalized = { ...result };

  if (normalized.confidence < 0.55 || normalized.imageQuality !== "GOOD" || normalized.overallRisk === "UNABLE_TO_DETERMINE") {
    normalized.overallRisk = "UNABLE_TO_DETERMINE";
    normalized.summary = "Unable to determine — veterinary review recommended.";
    normalized.recommendations = [];
    normalized.veterinaryAdvice = true;
    return normalized;
  }

  if (normalized.overallRisk === "RED" && !normalized.veterinaryAdvice) {
    normalized.veterinaryAdvice = true;
  }

  return normalized;
}
