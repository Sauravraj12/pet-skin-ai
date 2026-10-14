"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getEmptyScreeningHistorySnapshot,
  getScreeningHistorySnapshot,
  subscribeToScreeningHistory,
  type StoredScreening,
} from "@/lib/screenings/clientHistory";

const riskStyles: Record<StoredScreening["result"]["overallRisk"], string> = {
  GREEN: "bg-[#ECFDF5] text-[#0F766E]",
  YELLOW: "bg-[#FFF7ED] text-[#D97706]",
  RED: "bg-[#FEF2F2] text-[#DC2626]",
  UNABLE_TO_DETERMINE: "bg-slate-100 text-slate-700",
};

export default function HistoryPage() {
  const history = useSyncExternalStore(
    subscribeToScreeningHistory,
    getScreeningHistorySnapshot,
    getEmptyScreeningHistorySnapshot,
  );

  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#F8FAFC] px-4 py-6 text-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-[#0F766E]">← Home</Link>
        <span className="text-sm font-semibold text-slate-700">Screening history</span>
      </div>

      {history.length ? (
        <div className="space-y-4">
          {history.map((item) => (
            <article key={item.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{item.petName}</h2>
                  <p className="text-sm text-slate-500">{item.species}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${riskStyles[item.result.overallRisk]}`}>
                  {item.result.overallRisk.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              <p className="mt-3 text-sm text-slate-700">{item.result.summary}</p>
              <p className="mt-2 text-xs text-slate-500">
                Products: {item.recommendations.length ? item.recommendations.map((product) => product.name).join(", ") : "None recommended"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Product clicks: {item.productClicks?.length || 0}</p>
              <Link href={`/result?id=${encodeURIComponent(item.id)}`} className="mt-4 inline-flex rounded-full bg-[#0F766E] px-3 py-2 text-sm font-medium text-white">
                View report
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-lg font-bold">No screenings yet</h1>
          <p className="mt-2 text-sm text-slate-600">Completed reports on this device will appear here.</p>
          <Link href="/check" className="mt-4 inline-flex rounded-full bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white">Start a skin check</Link>
        </section>
      )}
    </main>
  );
}
