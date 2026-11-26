"use client";

import { useState, type FormEvent } from "react";

type VetCase = {
  id: string;
  screeningDate: string;
  overallRisk: string;
  imageQuality: string | null;
  summary: string | null;
  status: string;
  pet: { name: string; species: string; breed: string | null; age: string | null; weight: string | null };
  indicators: { code: string; label: string; severity: string }[];
};

export default function VeterinaryPage() {
  const [secret, setSecret] = useState("");
  const [cases, setCases] = useState<VetCase[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  async function load(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/veterinary/cases", { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" });
      const payload = await response.json() as { success: boolean; cases?: VetCase[]; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "Authorization failed.");
      setCases(payload.cases || []);
      setAuthorized(true);
    } catch (loadError) {
      setAuthorized(false);
      setError(loadError instanceof Error ? loadError.message : "Unable to load authorized cases.");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Veterinary collaboration</p>
      <h1 className="mt-2 text-3xl font-bold">Authorized case review</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Professional review is available only to authorized veterinarians. This interface does not verify a medical license and must not be used to imply that a clinician has reviewed a report until they are registered and authorized.
      </p>

      {!authorized ? (
        <form onSubmit={load} className="mt-8 max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-sm font-medium">Veterinarian access credential</label>
          <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
          {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
          <button type="submit" className="mt-4 w-full rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white">Open case workspace</button>
        </form>
      ) : (
        <section className="mt-8 grid gap-4">
          {cases.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No owner-authorized cases are currently available.</div>
          ) : cases.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">{item.pet.name} · {item.pet.species}</h2>
                  <p className="text-sm text-slate-500">{new Date(item.screeningDate).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{item.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-700">{item.summary || "No summary available."}</p>
              <p className="mt-2 text-xs text-slate-500">Risk: {item.overallRisk} · Image quality: {item.imageQuality || "Unknown"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.indicators.map((indicator) => <span key={indicator.code} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800">{indicator.label} · {indicator.severity}</span>)}
              </div>
              <button type="button" className="mt-5 rounded-full border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700">Review record</button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
