import assert from "node:assert/strict";
import test from "node:test";
import { buildRiskSummary } from "./riskEngine";
import type { AnalysisResult } from "../validation/schemas";

function result(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    petSpecies: "Dog",
    overallRisk: "GREEN",
    confidence: 0.9,
    imageQuality: "GOOD",
    visibleIndicators: [],
    summary: "Model summary.",
    recommendations: ["Monitor changes."],
    veterinaryAdvice: false,
    disclaimer: "Preliminary screening only.",
    ...overrides,
  };
}

test("preserves each explicit model risk instead of mapping indicators to Yellow", () => {
  assert.equal(buildRiskSummary(result({ overallRisk: "GREEN" })).overallRisk, "GREEN");
  assert.equal(buildRiskSummary(result({ overallRisk: "YELLOW" })).overallRisk, "YELLOW");
  assert.equal(buildRiskSummary(result({ overallRisk: "RED" })).overallRisk, "RED");
});

test("uses uncertainty for low confidence or unusable image quality", () => {
  const lowConfidence = buildRiskSummary(result({ confidence: 0.4 }));
  assert.equal(lowConfidence.overallRisk, "UNABLE_TO_DETERMINE");
  assert.deepEqual(lowConfidence.recommendations, []);
  assert.equal(lowConfidence.veterinaryAdvice, true);

  const poorQuality = buildRiskSummary(result({ imageQuality: "POOR" }));
  assert.equal(poorQuality.overallRisk, "UNABLE_TO_DETERMINE");
});