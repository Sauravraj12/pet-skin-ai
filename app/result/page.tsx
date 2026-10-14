"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Suspense, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { getMockAnalysisResult, type DemoScenario } from "@/lib/ai/mockProvider";
import { getRecommendedProducts, type ProductRecommendation } from "@/lib/recommendation/recommendationEngine";
import {
  getEmptyScreeningHistorySnapshot,
  getScreeningHistorySnapshot,
  recordProductClick,
  subscribeToScreeningHistory,
} from "@/lib/screenings/clientHistory";
import type { AnalysisResult } from "@/lib/validation/schemas";

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResultContent />
    </Suspense>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const history = useSyncExternalStore(
    subscribeToScreeningHistory,
    getScreeningHistorySnapshot,
    getEmptyScreeningHistorySnapshot,
  );
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const id = searchParams.get("id");
  const scenario = searchParams.get("scenario") as DemoScenario | null;
  const screening = id ? history.find((item) => item.id === id) : undefined;
  const demoResult = scenario === "GREEN" || scenario === "YELLOW" || scenario === "RED"
    ? getMockAnalysisResult(scenario)
    : null;
  const result: AnalysisResult | null = id ? screening?.result || null : demoResult;
  const recommendations: ProductRecommendation[] = id
    ? screening?.recommendations || []
    : demoResult ? getRecommendedProducts(demoResult) : [];
  const screeningId = id || (demoResult ? `demo_${demoResult.overallRisk.toLowerCase()}` : "");
  const loading = Boolean(id) && !hydrated;
  const error = id
    ? hydrated && !screening ? "This screening report is not available on this device. Start a new screening or open a saved report from history." : ""
    : !demoResult ? "No screening report was selected." : "";

  const handleProductClick = (productId: string) => {
    recordProductClick(screeningId, productId);
    const payload = JSON.stringify({
      screeningSessionId: screeningId,
      productId,
      source: "screening_report",
      referrer: window.location.pathname,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/product-click", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/analytics/product-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    }
  };

  if (loading) return <LoadingState />;

  if (error || !result) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-4 text-center text-slate-900">
        <p role="alert" className="rounded-2xl bg-white p-5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">{error || "Screening report unavailable."}</p>
        <Link href="/check" className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white">Start a new screening</Link>
        <Link href="/history" className="text-sm font-medium text-[#0F766E]">View history</Link>
      </main>
    );
  }

  const riskStyle = result.overallRisk === "GREEN"
    ? "bg-[#ECFDF5] text-[#0F766E]"
    : result.overallRisk === "YELLOW"
      ? "bg-[#FFF7ED] text-[#D97706]"
      : result.overallRisk === "RED"
        ? "bg-[#FEF2F2] text-[#DC2626]"
        : "bg-slate-100 text-slate-700";
  const riskLabel = result.overallRisk === "GREEN"
    ? "Low Concern"
    : result.overallRisk === "YELLOW"
      ? "Moderate Concern"
      : result.overallRisk === "RED"
        ? "High Concern"
        : "Unable to determine — veterinary review recommended";

  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#F8FAFC] px-4 pb-32 pt-6 text-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/history" className="text-sm font-medium text-[#0F766E]">← History</Link>
        <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Report</span>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="mb-4 text-xl font-bold">AI Skin Screening Result</h1>
        <p className="mb-3 text-sm text-slate-500">{result.petSpecies} skin screening</p>
        <div className={`flex items-center gap-3 rounded-2xl p-4 ${riskStyle}`}>
          {result.overallRisk === "GREEN" ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : result.overallRisk === "YELLOW" ? <AlertTriangle className="h-6 w-6 shrink-0" /> : <ShieldAlert className="h-6 w-6 shrink-0" />}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">{result.overallRisk.replaceAll("_", " ")}</p>
            <p className="text-xl font-bold">{riskLabel}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">{result.summary}</p>

        {result.visibleIndicators.length > 0 ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Detected indicators</p>
            <div className="mt-3 space-y-2">
              {result.visibleIndicators.map((indicator, index) => (
                <div key={`${indicator.code}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                  <span>{indicator.label}</span>
                  <span className="shrink-0 font-medium text-slate-600">{indicator.severity}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl bg-[#ECFDF5] p-4 text-sm text-slate-700">
          {result.veterinaryAdvice ? (
            <div className="flex items-start gap-3 text-[#0F766E]">
              <Stethoscope className="mt-0.5 h-5 w-5 shrink-0" />
              <p>For persistent, painful, rapidly worsening, bleeding, infected-looking, or severe lesions, consult a licensed veterinarian promptly.</p>
            </div>
          ) : (
            <p>{result.disclaimer}</p>
          )}
        </div>
      </section>

      {result.recommendations.length > 0 ? (
        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold">Screening guidance</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {result.recommendations.map((item, index) => (
              <li key={`${index}-${item}`} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#0F766E]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">Recommended products</h2>
        {recommendations.length ? (
          <div className="mt-4 space-y-3">
            {recommendations.map((product) => (
              <div key={product.id} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF5] text-xs font-semibold text-[#0F766E]">{product.category}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{product.name}</p>
                      <span className="shrink-0 text-xs font-medium text-[#0F766E]">{product.category}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{product.reason}</p>
                    <a href={product.purchaseUrl} target="_blank" rel="noreferrer" onClick={() => handleProductClick(product.id)} className="mt-2 inline-flex rounded-full bg-[#0F766E] px-3 py-2 text-xs font-medium text-white">View product</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">{result.overallRisk === "RED" ? "Please consult a veterinarian; supplements are not a substitute for medical care." : "No suitable product recommendations are available at this time."}</p>
        )}
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#0F766E]/20 border-t-[#0F766E]" />
        <p className="text-xl font-semibold">Loading your screening report...</p>
      </div>
    </main>
  );
}
