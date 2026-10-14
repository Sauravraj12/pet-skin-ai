import { NextResponse } from "next/server";
import { validatePetPhoto } from "@/lib/ai/visionProvider";
import { analyzePetSkin } from "@/lib/ai/skinAnalyzer";
import { getRecommendedProducts } from "@/lib/recommendation/recommendationEngine";
import { createPhotoValidationToken, verifyPhotoValidationToken } from "@/lib/screenings/validationToken";
import { detectImageMimeType, validateImage, validateImageSignature } from "@/lib/validation/image";

const wrongPhotoMessage = "⚠️ You selected the wrong photo. Please upload or capture a clear photo of a dog's or cat's skin.";
const unclearPhotoMessage = "We couldn't clearly confirm a dog or cat skin photo. Please try a brighter, closer, in-focus photo.";
const blurryPhotoMessage = "This photo is too blurry or unclear to assess. Please capture a focused, well-lit photo of your pet's skin.";

function jsonError(message: string, status: number, code: string) {
  return NextResponse.json({ success: false, code, message }, { status });
}

function validationTokenSecret(): string {
  return process.env.SCREENING_TOKEN_SECRET || process.env.AI_API_KEY || "";
}

export async function POST(request: Request) {
  let mode: string;

  try {
    const form = await request.formData();
    mode = String(form.get("mode") || "analyze");
    const image = form.get("image");

    if (mode !== "validate" && mode !== "analyze") {
      return jsonError("Unsupported screening request.", 400, "INVALID_MODE");
    }
    if (!(image instanceof File)) {
      return jsonError("Please select an image file.", 400, "MISSING_IMAGE");
    }

    const basicValidation = validateImage(image);
    if (!basicValidation.valid) return jsonError(basicValidation.message || "Invalid image.", 400, "INVALID_IMAGE");

    const bytes = new Uint8Array(await image.arrayBuffer());
    const signature = validateImageSignature(bytes);
    if (!signature.valid || !detectImageMimeType(bytes)) {
      return jsonError("This file is not a supported JPEG, PNG, or WEBP image.", 415, "UNSUPPORTED_IMAGE");
    }

    if (mode === "validate") {
      const validation = await validatePetPhoto(image);
      if (!validation.petDetected || (validation.petSpecies !== "Dog" && validation.petSpecies !== "Cat")) {
        return jsonError(wrongPhotoMessage, 422, "NOT_A_PET_PHOTO");
      }
      if (validation.confidence < 0.65) {
        return jsonError(unclearPhotoMessage, 422, "PET_NOT_CONFIRMED");
      }
      if (validation.imageQuality !== "GOOD") {
        return jsonError(blurryPhotoMessage, 422, "IMAGE_QUALITY_TOO_LOW");
      }

      return NextResponse.json({
        success: true,
        validation: {
          valid: true,
          species: validation.petSpecies,
          imageQuality: validation.imageQuality,
          token: createPhotoValidationToken(bytes, validation.petSpecies, validationTokenSecret()),
        },
      });
    }

    const validatedSpecies = verifyPhotoValidationToken(
      String(form.get("validationToken") || ""),
      bytes,
      validationTokenSecret(),
    );
    if (!validatedSpecies) {
      return jsonError("Photo validation expired or the image changed. Please validate the photo again.", 409, "REVALIDATE_REQUIRED");
    }

    const result = await analyzePetSkin({ image, species: validatedSpecies });
    return NextResponse.json({
      success: true,
      screeningId: crypto.randomUUID(),
      result,
      recommendations: getRecommendedProducts(result),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PET_PHOTO_REJECTED") {
      return jsonError(wrongPhotoMessage, 422, "NOT_A_PET_PHOTO");
    }

    console.error("[screenings/analyze] Vision request failed", error instanceof Error ? error.message : "unknown error");
    const notConfigured = process.env.AI_PROVIDER !== "vision_api" || !process.env.AI_API_KEY;
    return jsonError(
      notConfigured
        ? "Live pet-photo validation is not configured. Set AI_PROVIDER=vision_api and configure AI_API_KEY and AI_API_URL, then retry."
        : "We couldn't complete the image analysis. Please try again with a clear photo.",
      503,
      "VISION_UNAVAILABLE",
    );
  }
}
