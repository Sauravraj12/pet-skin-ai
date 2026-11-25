import assert from "node:assert/strict";
import test from "node:test";
import { isLiveVisionConfigured, validatePetPhoto } from "./visionProvider";

test("rejects live validation when the vision config is missing", async () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.AI_API_KEY;
  const previousOpenAIKey = process.env.OPENAI_API_KEY;

  delete process.env.AI_PROVIDER;
  delete process.env.AI_API_KEY;
  delete process.env.OPENAI_API_KEY;

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

    if (previousOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousOpenAIKey;
  }
});

test("recognizes OPENAI_API_KEY when the vision provider is enabled", () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.AI_API_KEY;
  const previousOpenAIKey = process.env.OPENAI_API_KEY;

  process.env.AI_PROVIDER = "vision_api";
  delete process.env.AI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";

  try {
    assert.equal(isLiveVisionConfigured(), true);
  } finally {
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;

    if (previousKey === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = previousKey;

    if (previousOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousOpenAIKey;
  }
});

test("uses the OpenAI SDK with either base URL or full chat-completions URL", async () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.AI_API_KEY;
  const previousOpenAIKey = process.env.OPENAI_API_KEY;
  const previousUrl = process.env.AI_API_URL;
  const previousFetch = globalThis.fetch;
  let requestedUrl = "";

  process.env.AI_PROVIDER = "vision_api";
  delete process.env.AI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";
  process.env.AI_API_URL = "https://example.test/v1/chat/completions";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({
      choices: [{
        message: {
          role: "assistant",
          content: JSON.stringify({
            petDetected: true,
            petSpecies: "Dog",
            confidence: 0.95,
            imageQuality: "GOOD",
          }),
        },
      }],
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const file = new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "pet-test.png", {
      type: "image/png",
    });

    const result = await validatePetPhoto(file);

    assert.equal(requestedUrl, "https://example.test/v1/chat/completions");
    assert.equal(result.petSpecies, "Dog");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;

    if (previousKey === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = previousKey;

    if (previousOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousOpenAIKey;

    if (previousUrl === undefined) delete process.env.AI_API_URL;
    else process.env.AI_API_URL = previousUrl;
  }
});
