import assert from "node:assert/strict";
import test from "node:test";
import { validatePetPhoto } from "./visionProvider";

test("uses a local fallback when the live vision config is missing", async () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.AI_API_KEY;

  delete process.env.AI_PROVIDER;
  delete process.env.AI_API_KEY;

  try {
    const file = new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "pet-test.png", {
      type: "image/png",
    });

    const result = await validatePetPhoto(file);
    assert.equal(result.petDetected, true);
    assert.ok(result.petSpecies === "Dog" || result.petSpecies === "Cat");
    assert.ok(result.confidence >= 0 && result.confidence <= 1);
    assert.ok(result.imageQuality === "GOOD" || result.imageQuality === "FAIR" || result.imageQuality === "POOR");
  } finally {
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;

    if (previousKey === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = previousKey;
  }
});
