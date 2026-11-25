import assert from "node:assert/strict";
import test from "node:test";
import { validatePetPhoto } from "./visionProvider";

test("rejects live validation when the vision config is missing", async () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.AI_API_KEY;

  delete process.env.AI_PROVIDER;
  delete process.env.AI_API_KEY;

  try {
    const file = new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "pet-test.png", {
      type: "image/png",
    });

    await assert.rejects(() => validatePetPhoto(file), /Live image analysis is not configured/);
  } finally {
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;

    if (previousKey === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = previousKey;
  }
});
