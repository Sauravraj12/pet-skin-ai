import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms and veterinary disclaimer" };

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Terms and veterinary disclaimer</h1>
      <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
        <p>This platform provides preliminary visual screening only. It does not diagnose disease, measure prognosis, or replace a licensed veterinarian&apos;s in-person assessment.</p>
        <p>AI results may be incomplete or incorrect. A Green, Yellow, or Red result is triage guidance based on the available image and must not delay urgent veterinary care.</p>
        <p>For trouble breathing, collapse, uncontrolled bleeding, severe pain, rapidly worsening swelling, or suspected poisoning, seek emergency veterinary care immediately.</p>
        <p>Product recommendations are general purchasing suggestions unless supported by manufacturer information and applicable authorization. They do not treat or cure disease. Do not give medicine or supplements without veterinary guidance.</p>
      </div>
    </main>
  );
}
