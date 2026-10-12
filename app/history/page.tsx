"use client";

import Link from "next/link";

const history = [
  {
    id: "1",
    petName: "Milo",
    date: "2026-09-25",
    risk: "YELLOW",
    indicators: "Hair loss, dryness, scaling",
    products: "Fur & Skin Care Lecithin, Functional Egg Roll",
  },
  {
    id: "2",
    petName: "Luna",
    date: "2026-09-20",
    risk: "GREEN",
    indicators: "None detected",
    products: "Daily Care Bundle",
  },
];

export default function HistoryPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#F8FAFC] px-4 py-6 text-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-[#0F766E]">← Home</Link>
        <span className="text-sm font-semibold text-slate-700">Screening history</span>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{item.petName}</h2>
              <span className="rounded-full bg-[#FFF7ED] px-2 py-1 text-xs font-semibold text-[#D97706]">{item.risk}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{item.date}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p><span className="font-medium">Indicators:</span> {item.indicators}</p>
              <p><span className="font-medium">Products:</span> {item.products}</p>
            </div>
            <Link href="/result?scenario=YELLOW" className="mt-4 inline-flex rounded-full bg-[#0F766E] px-3 py-2 text-sm font-medium text-white">View Report</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
