"use client";

import Link from "next/link";

const cards = [
  { label: "Total members", value: "124" },
  { label: "Total screenings", value: "318" },
  { label: "Green", value: "162" },
  { label: "Yellow", value: "99" },
  { label: "Red", value: "57" },
  { label: "Product clicks", value: "86" },
  { label: "CTR", value: "27%" },
];

const rows = [
  { date: "2026-09-25", pet: "Milo", species: "Dog", risk: "YELLOW", indicators: "Hair loss, dryness", products: "Fur & Skin Care Lecithin", clicks: 2 },
  { date: "2026-09-24", pet: "Luna", species: "Cat", risk: "GREEN", indicators: "None", products: "Daily Care", clicks: 0 },
  { date: "2026-09-22", pet: "Leo", species: "Dog", risk: "RED", indicators: "Redness, swelling", products: "Hypoallergenic Formula", clicks: 1 },
];

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-[#F8FAFC] px-4 py-6 text-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
          <h1 className="text-2xl font-bold">Analytics dashboard</h1>
        </div>
        <Link href="/" className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white">Home</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold">Screenings by day</h2>
          <div className="mt-4 flex h-36 items-end gap-2">
            {[28, 42, 61, 33, 55, 74, 60].map((height, idx) => (
              <div key={idx} className="flex-1 rounded-t-xl bg-[#0F766E]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold">Risk distribution</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "Green", value: 50, color: "bg-[#0F766E]" },
              { label: "Yellow", value: 30, color: "bg-[#D97706]" },
              { label: "Red", value: 20, color: "bg-[#DC2626]" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">Screening table</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Pet</th>
                <th className="pb-3 pr-4">Species</th>
                <th className="pb-3 pr-4">Risk</th>
                <th className="pb-3 pr-4">Indicators</th>
                <th className="pb-3 pr-4">Recommended Products</th>
                <th className="pb-3 pr-4">Product Clicks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.date}-${row.pet}`} className="border-b border-slate-100">
                  <td className="py-3 pr-4">{row.date}</td>
                  <td className="py-3 pr-4">{row.pet}</td>
                  <td className="py-3 pr-4">{row.species}</td>
                  <td className="py-3 pr-4">{row.risk}</td>
                  <td className="py-3 pr-4">{row.indicators}</td>
                  <td className="py-3 pr-4">{row.products}</td>
                  <td className="py-3 pr-4">{row.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
