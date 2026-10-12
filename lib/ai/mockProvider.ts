import type { AnalysisResult } from "@/lib/validation/schemas";

export type DemoScenario = "GREEN" | "YELLOW" | "RED";

export function getMockAnalysisResult(scenario: DemoScenario): AnalysisResult {
  const map: Record<DemoScenario, AnalysisResult> = {
    GREEN: {
      overallRisk: "GREEN",
      confidence: 0.86,
      imageQuality: "GOOD",
      visibleIndicators: [
        {
          code: "NORMAL_SKIN",
          label: "No significant visible abnormality",
          severity: "MILD",
          confidence: 0.8,
        },
      ],
      summary: "The uploaded image shows no obvious severe visible abnormality.",
      recommendations: [
        "Maintain regular grooming.",
        "Monitor changes in skin condition.",
      ],
      veterinaryAdvice: false,
      disclaimer: "This is an AI preliminary screening and not a veterinary diagnosis.",
    },
    YELLOW: {
      overallRisk: "YELLOW",
      confidence: 0.82,
      imageQuality: "GOOD",
      visibleIndicators: [
        {
          code: "HAIR_LOSS",
          label: "Hair loss",
          severity: "MODERATE",
          confidence: 0.78,
        },
        {
          code: "DRYNESS",
          label: "Possible dryness",
          severity: "MILD",
          confidence: 0.76,
        },
        {
          code: "SCALING",
          label: "Scaling",
          severity: "MILD",
          confidence: 0.74,
        },
      ],
      summary: "Visible skin indicators suggest mild dryness and scaling with some hair thinning.",
      recommendations: [
        "Monitor the affected area daily.",
        "Maintain appropriate grooming.",
        "Review diet and environment if it persists.",
      ],
      veterinaryAdvice: false,
      disclaimer: "This is an AI preliminary screening and not a veterinary diagnosis.",
    },
    RED: {
      overallRisk: "RED",
      confidence: 0.9,
      imageQuality: "GOOD",
      visibleIndicators: [
        {
          code: "REDNESS",
          label: "Redness",
          severity: "SEVERE",
          confidence: 0.91,
        },
        {
          code: "SWELLING",
          label: "Swelling",
          severity: "MODERATE",
          confidence: 0.88,
        },
        {
          code: "HAIR_LOSS",
          label: "Hair loss",
          severity: "MODERATE",
          confidence: 0.83,
        },
      ],
      summary: "Strong visible abnormality is present, including marked redness and hair loss pattern.",
      recommendations: [
        "Seek veterinary consultation for a closer exam.",
        "Avoid self-treating irritated skin areas.",
      ],
      veterinaryAdvice: true,
      disclaimer: "This is an AI preliminary screening and not a veterinary diagnosis.",
    },
  };

  return map[scenario];
}
