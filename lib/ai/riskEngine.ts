import type { AnalysisResult } from "@/lib/validation/schemas";

export function determineRiskFromIndicators(indicators: { code: string; severity?: string; confidence?: number }[]): "GREEN" | "YELLOW" | "RED" {
  const strongSignals = ["REDNESS", "SWELLING", "LESION", "HAIR_LOSS", "INFLAMMATION", "BLEEDING"];
  const moderateSignals = ["DRYNESS", "SCALING", "IRRITATION", "DANDRUFF", "KERATINIZATION"];

  const hasStrong = indicators.some((item) => strongSignals.includes(item.code) || (item.severity && ["SEVERE", "MODERATE"].includes(item.severity)));
  const hasModerate = indicators.some((item) => moderateSignals.includes(item.code));

  if (hasStrong) return "RED";
  if (hasModerate) return "YELLOW";
  return "GREEN";
}

export function buildRiskSummary(result: AnalysisResult): AnalysisResult {
  const risk = determineRiskFromIndicators(
    result.visibleIndicators.map((indicator) => ({
      code: indicator.code,
      severity: indicator.severity,
      confidence: indicator.confidence,
    })),
  );

  const normalized = { ...result, overallRisk: risk };

  if (risk === "RED" && !normalized.veterinaryAdvice) {
    normalized.veterinaryAdvice = true;
  }

  if (risk === "YELLOW") {
    normalized.summary = normalized.summary || "Some visible skin indicators were detected and should be monitored.";
  }

  if (risk === "GREEN") {
    normalized.summary = normalized.summary || "No obvious significant abnormality was detected in this image.";
  }

  return normalized;
}
