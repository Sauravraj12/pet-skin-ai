import { z } from "zod";
import { visionAssessmentSchema } from "@/lib/validation/schemas";
import type { AnalysisResult } from "@/lib/validation/schemas";
import { detectImageMimeType } from "@/lib/validation/image";

const petPhotoValidationSchema = z.object({
  petDetected: z.boolean(),
  petSpecies: z.enum(["Dog", "Cat", "Other", "Uncertain"]),
  confidence: z.number().min(0).max(1),
  imageQuality: z.enum(["GOOD", "FAIR", "POOR"]),
});

export type PetPhotoValidation = z.infer<typeof petPhotoValidationSchema>;

const systemPrompt = "You are a conservative preliminary pet skin-screening vision system. Inspect the actual supplied image pixels. Never infer findings that are not clearly visible. Do not diagnose disease or recommend medication. Return only JSON matching the requested fields. If uncertain, use UNABLE_TO_DETERMINE and explain uncertainty.";

function getVisionConfig() {
  if (process.env.AI_PROVIDER !== "vision_api" || !process.env.AI_API_KEY) {
    throw new Error("Live image analysis is not configured. Set AI_PROVIDER=vision_api and AI_API_KEY. AI_API_URL is optional when using the default OpenAI endpoint.");
  }

  return {
    url: process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions",
    key: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || "gpt-4o-mini",
  };
}

async function requestVisionJson<T>(image: File, prompt: string, schema: z.ZodType<T>): Promise<T> {
  const config = getVisionConfig();
  const bytes = new Uint8Array(await image.arrayBuffer());
  const mimeType = detectImageMimeType(bytes);
  if (!mimeType) throw new Error("The uploaded file is not a supported image.");

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`, detail: "high" },
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    throw new Error(`Vision service request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Vision service returned an unreadable response.");

  let decoded: unknown;
  try {
    decoded = JSON.parse(content);
  } catch {
    throw new Error("Vision service returned invalid JSON.");
  }

  const parsed = schema.safeParse(decoded);
  if (!parsed.success) throw new Error("Vision service response did not match the screening schema.");
  return parsed.data;
}

export async function validatePetPhoto(image: File): Promise<PetPhotoValidation> {
  return requestVisionJson(
    image,
    "First determine whether this image clearly contains one dog or one cat, and identify which. Do not analyze skin. Reject people, objects, food, scenery, multiple ambiguous subjects, generic portraits, or images where a pet cannot be confirmed. Require a close, in-focus view of a pet skin/fur area suitable for preliminary visual screening. Return JSON with petDetected (boolean), petSpecies (Dog, Cat, Other, or Uncertain), confidence (0 to 1), and imageQuality (GOOD, FAIR, or POOR). Use POOR for blurry, too dark, obstructed, too distant, or unusable images.",
    petPhotoValidationSchema,
  );
}

export async function analyzeValidatedPetPhoto(image: File, species: "Dog" | "Cat"): Promise<AnalysisResult> {
  const assessment = await requestVisionJson(
    image,
    `Analyze only visible skin/fur features of the confirmed ${species}. Return JSON with petDetected, petSpecies, overallRisk (GREEN, YELLOW, RED, or UNABLE_TO_DETERMINE), confidence (0 to 1), imageQuality (GOOD, FAIR, or POOR), visibleIndicators (objects with code, label, severity MILD/MODERATE/SEVERE, confidence 0 to 1), summary, recommendations, veterinaryAdvice (boolean), and disclaimer. Use indicator codes from REDNESS, SWELLING, LESION, HAIR_LOSS, INFLAMMATION, BLEEDING, DRYNESS, SCALING, DANDRUFF, IRRITATION, SENSITIVE_SKIN, NORMAL_SKIN, or OTHER. GREEN means no obvious abnormality. YELLOW means possible mild localized change. RED is only for pronounced or extensive visible abnormality and must set veterinaryAdvice true. Use UNABLE_TO_DETERMINE for uncertain evidence. Do not report normal skin as a concern. Keep recommendations general and non-medical.`,
    visionAssessmentSchema,
  );

  if (!assessment.petDetected || assessment.petSpecies !== species) {
    throw new Error("PET_PHOTO_REJECTED");
  }

  return {
    ...assessment,
    petSpecies: species,
  };
}
