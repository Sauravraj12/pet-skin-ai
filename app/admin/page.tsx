"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Analytics = {
  totalMembers: number;
  totalScreenings: number;
  green: number;
  yellow: number;
  red: number;
  productClicks: number;
  clickThroughRate: number;
  screeningsByDay: { day: string; count: number }[];
};

const emptyAnalytics: Analytics = {
  totalMembers: 0,
  totalScreenings: 0,
  green: 0,
  yellow: 0,
  red: 0,
  productClicks: 0,
  clickThroughRate: 0,
  screeningsByDay: [],
};

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin/analytics", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as Analytics & { success?: boolean; message?: string };
        if (!response.ok) throw new Error(payload.message || "Unable to load analytics.");
        setAnalytics(payload);
      })
      .catch((fetchError: unknown) => setError(fetchError instanceof Error ? fetchError.message : "Unable to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total members", value: analytics.totalMembers },
    { label: "Total screenings", value: analytics.totalScreenings },
    { label: "Green", value: analytics.green },
    { label: "Yellow", value: analytics.yellow },
    { label: "Red", value: analytics.red },
    { label: "Product clicks", value: analytics.productClicks },
    { label: "CTR", value: `${Math.round(analytics.clickThroughRate * 100)}%` },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-[#F8FAFC] px-4 py-6 text-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
          <h1 className="text-2xl font-bold">Analytics dashboard</h1>
        </div>
        <Link href="/" className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white">Home</Link>
      </div>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7" aria-busy={loading}>
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{loading ? "-" : card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">Screenings by day</h2>
        {analytics.screeningsByDay.length ? (
          <div className="mt-4 grid grid-cols-7 gap-2">
            {analytics.screeningsByDay.map((item) => (
              <div key={item.day} className="text-center">
                <div className="mx-auto flex h-36 items-end">
                  <div className="w-full rounded-t-xl bg-[#0F766E]" style={{ height: `${Math.max(8, item.count)}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.day}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No persisted analytics yet.</p>
        )}
      </div>
    </main>
  );
}
