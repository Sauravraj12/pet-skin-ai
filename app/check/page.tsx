"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Camera, ImageIcon, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { compressImage, validateImage } from "@/lib/validation/image";

export default function CheckPage() {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
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

  const canSubmit = useMemo(() => {
    return petName.trim() && species && consent && file;
  }, [petName, species, consent, file]);

  const handleFileChange = (selectedFile: File | null) => {
    setError("");
    if (!selectedFile) return;

    const validation = validateImage(selectedFile);
    if (!validation.valid) {
      setError(validation.message || "Image validation failed.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);
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
    if (!canSubmit) {
      setError("Please provide pet details, consent, and an image.");
      return;
    }

    const compressed = await compressImage(file!);
    const params = new URLSearchParams({
      petName,
      species,
      ownerName,
      email,
      mobile,
      lineId,
      consent: consent ? "true" : "false",
    });

    const qs = params.toString();
    router.push(`/result?${qs}&image=${encodeURIComponent(URL.createObjectURL(compressed))}`);
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
              <input value={petName} onChange={(e) => setPetName(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none ring-0 focus:border-[#0F766E]" placeholder="Milo" required />
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Species
              <select value={species} onChange={(e) => setSpecies(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-[#0F766E]">
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
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-3 py-3 text-sm font-medium text-white"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </button>

              <button
                type="button"
                onClick={triggerGalleryInput}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700"
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
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0F766E]" />
            <span>
              By continuing, you agree that the uploaded pet image and information may be processed to provide this AI preliminary screening service. I understand that this AI result is not a veterinary diagnosis.
            </span>
          </label>

          <div className="flex items-center gap-2 rounded-2xl bg-[#F8FAFC] p-3 text-xs text-slate-600">
            <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
            AI screening provides preliminary information based on the uploaded image and does not replace professional veterinary diagnosis.
          </div>

          {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button type="submit" disabled={!canSubmit} className="w-full rounded-2xl bg-[#0F766E] py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
            Start AI screening
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
