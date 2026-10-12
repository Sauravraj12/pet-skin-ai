"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const scenarios = [
  { key: "GREEN", label: "Demo Green" },
  { key: "YELLOW", label: "Demo Yellow" },
  { key: "RED", label: "Demo Red" },
];

export default function DemoPage() {
  const router = useRouter();

  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#F8FAFC] px-4 py-6 text-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-[#0F766E]">← Home</Link>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold">Demo mode</h1>
        <p className="mt-2 text-sm text-slate-600">This is only for presentation and testing. It launches a realistic screening flow.</p>

        <div className="mt-5 space-y-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.key}
              onClick={() => router.push(`/result?scenario=${scenario.key}`)}
              className="w-full rounded-2xl bg-[#0F766E] py-3 text-base font-semibold text-white"
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
