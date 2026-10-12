"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert, Stethoscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMockAnalysisResult } from "@/lib/ai/mockProvider";
import { getRecommendedProducts, type ProductRecommendation } from "@/lib/recommendation/recommendationEngine";
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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scenario = searchParams.get("scenario") || "YELLOW";
    const request = async () => {
      setLoading(true);
      const data = getMockAnalysisResult(scenario as "GREEN" | "YELLOW" | "RED");
      setResult(data);
      setLoading(false);
    };
    request();
  }, [searchParams]);

  const recommendations = useMemo<ProductRecommendation[]>(() => {
    if (!result) return [];
    return getRecommendedProducts(result);
  }, [result]);

  if (loading || !result) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#0F766E]/20 border-t-[#0F766E]" />
          <p className="text-xl font-semibold">Analyzing visible skin indicators...</p>
          <p className="mt-2 text-sm text-slate-500">Preparing your report...</p>
        </div>
      </main>
    );
  }

  const riskStyle =
    result.overallRisk === "GREEN"
      ? "bg-[#ECFDF5] text-[#0F766E]"
      : result.overallRisk === "YELLOW"
        ? "bg-[#FFF7ED] text-[#D97706]"
        : "bg-[#FEF2F2] text-[#DC2626]";

  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#F8FAFC] px-4 pb-32 pt-6 text-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/check" className="text-sm font-medium text-[#0F766E]">← Back</Link>
        <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
          Report
        </span>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="mb-4 text-xl font-bold">AI Skin Screening Result</h1>
        <div className={`flex items-center gap-3 rounded-2xl p-4 ${riskStyle}`}>
          {result.overallRisk === "GREEN" ? <CheckCircle2 className="h-6 w-6" /> : result.overallRisk === "YELLOW" ? <AlertTriangle className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">{result.overallRisk}</p>
            <p className="text-2xl font-bold">
              {result.overallRisk === "GREEN" ? "Low Visible Concern" : result.overallRisk === "YELLOW" ? "Mild Warning" : "High Abnormality Detected"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">{result.summary}</p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Detected indicators</p>
          <div className="mt-3 space-y-2">
            {result.visibleIndicators.map((indicator) => (
              <div key={indicator.code} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                <span>{indicator.label}</span>
                <span className="font-medium text-slate-600">{indicator.severity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#ECFDF5] p-4 text-sm text-slate-700">
          {result.veterinaryAdvice ? (
            <div className="flex items-start gap-3 text-[#0F766E]">
              <Stethoscope className="mt-0.5 h-5 w-5" />
              <p>For persistent, painful, rapidly worsening, bleeding, infected-looking, or severe lesions, consult a licensed veterinarian.</p>
            </div>
          ) : (
            <p>AI screening provides preliminary information based on the uploaded image and does not replace professional veterinary diagnosis.</p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">Recommendations</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {result.recommendations.map((item: string) => (
            <li key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0F766E]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">Recommended products</h2>
        <div className="mt-4 space-y-3">
          {recommendations.map((product) => (
            <div key={product.id} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#ECFDF5]">
                  <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{product.name}</p>
                    <span className="text-xs font-medium text-[#0F766E]">{product.category}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{product.reason}</p>
                  <a href={product.purchaseUrl} className="mt-2 inline-flex rounded-full bg-[#0F766E] px-3 py-2 text-xs font-medium text-white">View Exclusive Offer</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#0F766E]/20 border-t-[#0F766E]" />
        <p className="text-xl font-semibold">Analyzing visible skin indicators...</p>
        <p className="mt-2 text-sm text-slate-500">Preparing your report...</p>
      </div>
    </main>
  );
}
