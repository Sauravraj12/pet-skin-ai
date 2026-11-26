import { NextResponse } from "next/server";
import { validatePetPhoto } from "@/lib/ai/visionProvider";
import { analyzePetSkin } from "@/lib/ai/skinAnalyzer";
import { getRecommendedProducts } from "@/lib/recommendation/recommendationEngine";
import { createPhotoValidationToken, verifyPhotoValidationToken } from "@/lib/screenings/validationToken";
import { detectImageMimeType, validateImage, validateImageSignature } from "@/lib/validation/image";
import { getDatabase } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

const wrongPhotoMessage = "⚠️ You selected the wrong photo. Please upload or capture a clear photo of a dog's or cat's skin.";
const unclearPhotoMessage = "We couldn't clearly confirm a dog or cat skin photo. Please try a brighter, closer, in-focus photo.";
const blurryPhotoMessage = "This photo is too blurry or unclear to assess. Please capture a focused, well-lit photo of your pet's skin.";

function jsonError(message: string, status: number, code: string) {
  return NextResponse.json({ success: false, code, message }, { status });
}

function validationTokenSecret(): string {
  const secret = process.env.SCREENING_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SCREENING_TOKEN_SECRET must contain at least 32 characters.");
  }
  return secret;
}

export async function POST(request: Request) {
  let mode: string;

  try {
    const forwarded = request.headers.get("x-forwarded-for") || "unknown";
    const ip = forwarded.split(",")[0]?.trim() || "unknown";
    const limit = checkRateLimit(`screening:${ip}`, 12, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, code: "RATE_LIMITED", message: "Too many screening requests. Please wait before retrying." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }
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
    const petName = String(form.get("petName") || "Unnamed pet").trim().slice(0, 80);
    const ownerName = String(form.get("ownerName") || "").trim().slice(0, 120) || null;
    const email = String(form.get("email") || "").trim().slice(0, 254) || null;
    const consent = String(form.get("consent") || "") === "true";
    let screeningId = crypto.randomUUID();
    let persisted = false;

    if (process.env.DATABASE_URL || process.env.DIRECT_URL) {
      try {
        const db = getDatabase();
        const member = await db.member.create({
          data: {
            name: ownerName,
            email,
            consentRecords: consent ? {
              create: {
                type: "SCREENING_STORAGE",
                granted: true,
                documentVersion: "2026-11-26",
              },
            } : undefined,
          },
        });
        const pet = await db.pet.create({
          data: {
            memberId: member.id,
            name: petName,
            species: validatedSpecies,
            breed: String(form.get("breed") || "").trim().slice(0, 80) || null,
            age: String(form.get("age") || "").trim().slice(0, 40) || null,
            sex: String(form.get("sex") || "").trim().slice(0, 20) || null,
            weight: String(form.get("weight") || "").trim().slice(0, 40) || null,
          },
        });
        const saved = await db.screeningSession.create({
          data: {
            memberId: member.id,
            petId: pet.id,
            providerName: process.env.AI_PROVIDER || "not-configured",
            providerStatus: "SUCCESS",
            overallRisk: result.overallRisk,
            confidence: result.confidence,
            imageQuality: result.imageQuality,
            summary: result.summary,
            indicators: {
              create: result.visibleIndicators.map((indicator) => ({
                code: indicator.code,
                label: indicator.label,
                severity: indicator.severity,
                confidence: indicator.confidence,
              })),
            },
          },
        });
        screeningId = saved.id;
        persisted = true;

        await db.notification.create({
          data: {
            memberId: member.id,
            screeningSessionId: saved.id,
            type: "REPORT_STATUS",
            title: "Screening report ready",
            body: "Your preliminary pet skin screening report is ready to review.",
          },
        });
      } catch (error) {
        console.error("[screenings/analyze] Database persistence failed", error instanceof Error ? error.message : "unknown error");
      }
    }

    if (!persisted) {
      console.warn("[screenings/analyze] Returning live AI result without database persistence.");
    }

    return NextResponse.json({
      success: true,
      screeningId,
      persisted,
      result,
      recommendations: getRecommendedProducts(result),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PET_PHOTO_REJECTED") {
      return jsonError(wrongPhotoMessage, 422, "NOT_A_PET_PHOTO");
    }

    console.error("[screenings/analyze] Vision request failed", error instanceof Error ? error.message : "unknown error");
    return jsonError("Live photo screening is unavailable right now. Please try again later.", 503, "VISION_UNAVAILABLE");
  }
}
