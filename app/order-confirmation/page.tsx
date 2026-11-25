"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SiteHeader from "@/components/site-header";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<main className="min-h-screen px-4 pt-6"><SiteHeader /></main>}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const total = params.get("total");

  return (
    <main className="min-h-screen px-4 pb-16 pt-6 sm:px-6">
      <SiteHeader />
      <section className="mx-auto max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-16 w-16 text-[#0F766E]" />
        <h1 className="mt-4 text-3xl font-black">Order confirmed</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Your demo order has been saved on this device.</p>
        {id ? <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">Order</span> <strong>{id}</strong></p> : null}
        {total ? <p className="mt-2 text-lg font-bold">${total}</p> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/products" className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold">Continue shopping</Link>
          <Link href="/" className="flex-1 rounded-full bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white">Return home</Link>
        </div>
      </section>
    </main>
  );
}
