import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Privacy notice</h1>
      <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
        <p>Pet photos and owner-entered information are used to provide preliminary skin screening and to save reports. Image content is not displayed on public URLs. Live AI requests are sent to the configured vision provider only when a provider key is available.</p>
        <p>Do not upload identifiable documents or information unrelated to the pet screening. Avoid sharing photos containing people or home-identifying details.</p>
        <p>Before database persistence is enabled, screening history may be stored only in this browser&apos;s local storage. Database-backed deployments require configured PostgreSQL storage and a secure object-storage provider for uploaded images.</p>
        <p>The platform should provide a verifiable deletion workflow before production use. Until that workflow is activated for your deployment, ask the service operator to delete any submitted records.</p>
      </div>
    </main>
  );
}
