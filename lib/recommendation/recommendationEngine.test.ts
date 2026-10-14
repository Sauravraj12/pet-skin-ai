import assert from "node:assert/strict";
import test from "node:test";
import { getRecommendedProducts } from "./recommendationEngine";
import type { AnalysisResult } from "../validation/schemas";

function result(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    petSpecies: "Dog",
    overallRisk: "YELLOW",
    confidence: 0.9,
    imageQuality: "GOOD",
    visibleIndicators: [],
    summary: "Model summary.",
    recommendations: [],
    veterinaryAdvice: false,
    disclaimer: "Preliminary screening only.",
    ...overrides,
  };
}

test("selects only products matched to a detected concern and species", () => {
  const products = getRecommendedProducts(result({
    petSpecies: "Cat",
    visibleIndicators: [
      { code: "DRYNESS", label: "Dryness", severity: "MILD", confidence: 0.8 },
      { code: "DRYNESS", label: "Dryness", severity: "MILD", confidence: 0.8 },
    ],
  }));

  assert.deepEqual(products.map((product) => product.id), ["prod_fur_skin_lecithin"]);
  assert.match(products[0].reason, /dryness/i);
});

test("normalizes model concern codes before matching products", () => {
  const products = getRecommendedProducts(result({
    visibleIndicators: [{ code: "dandruff", label: "Dandruff", severity: "MILD", confidence: 0.8 }],
  }));

  assert.deepEqual(products.map((product) => product.id), ["prod_fur_skin_lecithin"]);
});

test("returns no supplements for high-risk, uncertain, or unmatched findings", () => {
  assert.deepEqual(getRecommendedProducts(result({ overallRisk: "RED" })), []);
  assert.deepEqual(getRecommendedProducts(result({ overallRisk: "UNABLE_TO_DETERMINE" })), []);
  assert.deepEqual(getRecommendedProducts(result({ visibleIndicators: [{ code: "UNKNOWN", label: "Unknown", severity: "MILD", confidence: 0.5 }] })), []);
});

test("green recommendations use general-care catalog tags", () => {
  const products = getRecommendedProducts(result({ overallRisk: "GREEN" }));
  assert.ok(products.length > 0);
  assert.ok(products.every((product) => product.id === "prod_functional_egg_roll"));
});