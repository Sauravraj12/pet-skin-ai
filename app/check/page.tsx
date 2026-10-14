"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Camera, ImageIcon, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateImage, validateImageFile } from "@/lib/validation/image";
import { saveScreeningHistory } from "@/lib/screenings/clientHistory";
import type { AnalysisResult } from "@/lib/validation/schemas";
import type { ProductRecommendation } from "@/lib/recommendation/recommendationEngine";

export default function CheckPage() {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const validationRequestRef = useRef(0);
  const submissionLockRef = useRef(false);
  const [petName, setPetName] = useState("Milo");
  const [species, setSpecies] = useState("Dog");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [lineId, setLineId] = useState("");
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | "">("");
  const [validatingPhoto, setValidatingPhoto] = useState(false);
  const [photoValidated, setPhotoValidated] = useState(false);
  const [validationToken, setValidationToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return petName.trim() && consent && file && photoValidated && validationToken && !validatingPhoto && !submitting;
  }, [petName, consent, file, photoValidated, validationToken, validatingPhoto, submitting]);

  const clearPhoto = (cancelPendingValidation = true) => {
    if (cancelPendingValidation) {
      validationRequestRef.current += 1;
      setValidatingPhoto(false);
    }
    setFile(null);
    setPhotoValidated(false);
    setValidationToken("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
  };

  const validatePetPhoto = async (selectedFile: File) => {
    const requestId = ++validationRequestRef.current;
    setError("");
    setPhotoValidated(false);
    setValidatingPhoto(true);

    try {
      const form = new FormData();
      form.set("mode", "validate");
      form.set("image", selectedFile);
      const response = await fetch("/api/screenings/analyze", { method: "POST", body: form });
      const payload = await response.json() as {
        success: boolean;
        validation?: { valid: boolean; species: "Dog" | "Cat"; token: string };
        code?: string;
        message?: string;
      };

      if (requestId !== validationRequestRef.current) return;
      if (!response.ok || !payload.success || !payload.validation?.valid) {
        setError(payload.message || "We couldn't validate this photo. Please try another clear pet photo.");
        if (payload.code === "NOT_A_PET_PHOTO" || payload.code === "IMAGE_QUALITY_TOO_LOW" || payload.code === "PET_NOT_CONFIRMED") {
          clearPhoto(false);
        }
        return;
      }

      setSpecies(payload.validation.species);
      setValidationToken(payload.validation.token);
      setPhotoValidated(true);
    } catch {
      if (requestId === validationRequestRef.current) {
        setError("Photo validation is unavailable. Check your connection and retry validation.");
      }
    } finally {
      if (requestId === validationRequestRef.current) setValidatingPhoto(false);
    }
  };

  const handleFileChange = async (selectedFile: File | null) => {
    setError("");
    if (!selectedFile) return;

    clearPhoto();
    const selectionId = validationRequestRef.current;
    const validation = validateImage(selectedFile);
    if (!validation.valid) {
      setError(validation.message || "Image validation failed.");
      return;
    }

    const decodedValidation = await validateImageFile(selectedFile);
    if (selectionId !== validationRequestRef.current) return;
    if (!decodedValidation.valid) {
      setError(decodedValidation.message || "Image validation failed.");
      return;
    }

    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);
    await validatePetPhoto(selectedFile);
  };

  const triggerCameraInput = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
    cameraInputRef.current?.click();
  };

  const triggerGalleryInput = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
    galleryInputRef.current?.click();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLockRef.current) return;
    if (!canSubmit || !file) {
      setError("Please provide pet details, consent, and a validated dog or cat photo.");
      return;
    }

    submissionLockRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.set("mode", "analyze");
      form.set("image", file);
      form.set("species", species);
      form.set("validationToken", validationToken);
      const response = await fetch("/api/screenings/analyze", { method: "POST", body: form });
      const payload = await response.json() as {
        success: boolean;
        screeningId?: string;
        result?: AnalysisResult;
        recommendations?: ProductRecommendation[];
        code?: string;
        message?: string;
      };

      if (!response.ok || !payload.success || !payload.screeningId || !payload.result) {
        if (payload.code === "NOT_A_PET_PHOTO" || payload.code === "IMAGE_QUALITY_TOO_LOW" || payload.code === "PET_NOT_CONFIRMED") {
          setError(payload.message || "This photo could not be confirmed. Please choose another clear pet photo.");
          clearPhoto(false);
          submissionLockRef.current = false;
          setSubmitting(false);
          return;
        }
        if (payload.code === "REVALIDATE_REQUIRED") {
          setPhotoValidated(false);
          setValidationToken("");
        }
        throw new Error(payload.message || "We couldn't complete the screening. Please retry.");
      }

      saveScreeningHistory({
        id: payload.screeningId,
        petName: petName.trim(),
        species: payload.result.petSpecies,
        createdAt: new Date().toISOString(),
        result: payload.result,
        recommendations: payload.recommendations || [],
      });
      router.push(`/result?id=${encodeURIComponent(payload.screeningId)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We couldn't complete the screening. Please retry.");
      submissionLockRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#F8FAFC] px-4 pb-24 pt-6 text-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-[#0F766E]">← Back</Link>
        <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
          Skin Check
        </span>
      </div>

      <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-2xl bg-[#ECFDF5] p-2 text-[#0F766E]">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step 1</p>
            <h1 className="text-xl font-bold">Pet details</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <label className="grid gap-1 text-sm font-medium">
              Pet name
              <input value={petName} onChange={(e) => setPetName(e.target.value)} disabled={submitting} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none ring-0 focus:border-[#0F766E] disabled:opacity-60" placeholder="Milo" required />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Species
              <select value={species} onChange={(e) => setSpecies(e.target.value)} disabled={submitting} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-[#0F766E] disabled:opacity-60">
                <option>Dog</option>
                <option>Cat</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm" placeholder="Owner name (optional)" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm" placeholder="Email (optional)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm" placeholder="Mobile (optional)" />
              <input value={lineId} onChange={(e) => setLineId(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm" placeholder="LINE ID (optional)" />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#0F766E]/40 bg-[#ECFDF5] p-4">
            <div className="mb-3 flex items-center gap-2 text-[#0F766E]">
              <UploadCloud className="h-4 w-4" />
              <span className="text-sm font-semibold">Upload pet skin photo</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={triggerCameraInput}
                disabled={submitting || validatingPhoto}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-3 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </button>

              <button
                type="button"
                onClick={triggerGalleryInput}
                disabled={submitting || validatingPhoto}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                <ImageIcon className="h-4 w-4" />
                Gallery
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                handleFileChange(e.target.files?.[0] || null);
                e.target.value = "";
              }}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                handleFileChange(e.target.files?.[0] || null);
                e.target.value = "";
              }}
            />

            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3 text-sm text-slate-600">
              <ImageIcon className="h-5 w-5 text-[#0F766E]" />
              <span>{file ? file.name : "JPG, JPEG, PNG, WEBP up to 10 MB"}</span>
            </div>

            {previewUrl ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                <Image src={previewUrl} alt="Pet preview" width={640} height={320} className="h-44 w-full object-cover" />
              </div>
            ) : null}

            {validatingPhoto ? (
              <div role="status" className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3 text-sm text-slate-700">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0F766E]/20 border-t-[#0F766E]" />
                Checking that this is a clear dog or cat photo...
              </div>
            ) : null}

            {submitting ? (
              <div role="status" className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3 text-sm text-slate-700">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0F766E]/20 border-t-[#0F766E]" />
                Analyzing the verified pet photo...
              </div>
            ) : null}

            {error ? <div role="alert" className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            {file && !photoValidated && !validatingPhoto && error && !error.includes("wrong photo") ? (
              <button type="button" onClick={() => void validatePetPhoto(file)} className="mt-2 text-sm font-semibold text-[#0F766E] underline">
                Retry photo validation
              </button>
            ) : null}
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={submitting} className="mt-0.5 h-4 w-4 accent-[#0F766E] disabled:opacity-60" />
            <span>
              By continuing, you agree that the uploaded pet image and information may be processed to provide this AI preliminary screening service. I understand that this AI result is not a veterinary diagnosis.
            </span>
          </label>

          <div className="flex items-center gap-2 rounded-2xl bg-[#F8FAFC] p-3 text-xs text-slate-600">
            <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
            AI screening provides preliminary information based on the uploaded image and does not replace professional veterinary diagnosis.
          </div>

          <button type="submit" disabled={!canSubmit} className="w-full rounded-2xl bg-[#0F766E] py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
            {submitting ? "Analyzing photo..." : "Start AI screening"}
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-[#D97706]" />
            Preliminary screening in approximately 5 seconds.
          </div>
        </form>
      </div>
    </main>
  );
}
