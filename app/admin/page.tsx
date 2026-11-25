"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

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
  const [adminSecret, setAdminSecret] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAnalytics(secret: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/analytics", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${secret}` },
      });
      const payload = await response.json() as Analytics & { message?: string };
      if (!response.ok) throw new Error(payload.message || "Unable to load analytics.");
      setAnalytics(payload);
      setAuthorized(true);
    } catch (fetchError: unknown) {
      setAuthorized(false);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadAnalytics(adminSecret);
  }

  function handleLogout() {
    setAuthorized(false);
    setAdminSecret("");
    setAnalytics(emptyAnalytics);
    setError("");
  }

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

      {!authorized ? (
        <section className="mx-auto mt-16 max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]">Restricted area</p>
            <h2 className="mt-2 text-xl font-bold">Admin sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Enter the admin secret configured on the server to view analytics.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <label htmlFor="admin-secret" className="block text-sm font-medium text-slate-700">Admin secret</label>
            <input
              id="admin-secret"
              name="admin-secret"
              type="password"
              autoComplete="current-password"
              required
              value={adminSecret}
              onChange={(event) => setAdminSecret(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
            />
            {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      ) : (
        <>
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
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#0F766E] hover:text-[#0F766E]"
          >
            Sign out
          </button>
        </>
      )}
    </main>
  );
}
