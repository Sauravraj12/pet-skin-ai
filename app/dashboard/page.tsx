"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getEmptyScreeningHistorySnapshot, getScreeningHistorySnapshot, subscribeToScreeningHistory } from "@/lib/screenings/clientHistory";

export default function DashboardPage() {
  const history = useSyncExternalStore(subscribeToScreeningHistory, getScreeningHistorySnapshot, getEmptyScreeningHistorySnapshot);
  const pets = [...new Map(history.map((item) => [item.petName.toLowerCase(), item])).values()];
  const riskCounts = history.reduce((counts, item) => {
    counts[item.result.overallRisk] = (counts[item.result.overallRisk] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Health dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Pet health overview</h1>
        </div>
        <Link href="/check" className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white">New screening</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Registered pets" value={pets.length} />
        <Metric label="Screening reports" value={history.length} />
        <Metric label="Recent red reports" value={riskCounts.RED || 0} />
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold">Risk distribution</h2>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {["GREEN", "YELLOW", "RED", "UNABLE_TO_DETERMINE"].map((risk) => (
              <div key={risk} className="rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">{risk === "UNABLE_TO_DETERMINE" ? "UNKNOWN" : risk}</p>
                <p className="mt-1 text-xl font-bold">{riskCounts[risk] || 0}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold">Follow-up</h2>
          {history.length ? (
            <p className="mt-3 text-sm text-slate-600">
              Schedule a repeat photo for persistent changes or follow the guidance in the latest report. No reminder is active in this local-only demo view.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Complete a screening to establish your pet health timeline.</p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Recent screening activity</h2>
        {history.length ? (
          <div className="mt-4 space-y-3">
            {history.slice(0, 8).map((item) => (
              <Link key={item.id} href={`/result?id=${encodeURIComponent(item.id)}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <span><strong>{item.petName}</strong> · {item.species}</span>
                <span className="text-slate-500">{item.result.overallRisk} · {new Date(item.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">No screenings have been saved on this device yet.</p>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
