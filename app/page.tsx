import Link from "next/link";
import { Shield, Smartphone, Sparkles } from "lucide-react";
import SiteHeader from "@/components/site-header";

const benefits = [
  { icon: Smartphone, title: "Smartphone-based", description: "Take a pet skin photo directly from your phone." },
  { icon: Sparkles, title: "Fast preliminary screening", description: "Get a risk assessment in seconds from the uploaded image." },
  { icon: Shield, title: "Personalized recommendations", description: "See matched product suggestions based on visible indicators." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <section className="mx-auto max-w-md px-4 pb-16 pt-6 sm:max-w-5xl">
        <SiteHeader />

        <div className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white via-[#f8fafc] to-[#ecfdf5] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] ring-1 ring-white/70 sm:grid-cols-2 sm:items-center sm:p-8">
          <div>
            <span className="inline-flex rounded-full bg-[#ECFDF5] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0F766E]">
              AI preliminary skin screening
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Smarter pet skin care starts here.
            </h1>
            <p className="mt-4 max-w-md text-lg text-slate-600">
              Check visible skin conditions from a smartphone photo in seconds and receive practical, personalized guidance.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/check" className="rounded-full bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,118,110,0.24)] transition hover:bg-[#115e59]">Start Skin Check</Link>
              <Link href="/how-it-works" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#0F766E] hover:text-[#0F766E]">How It Works</Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              AI screening provides preliminary information based on the uploaded image and does not replace professional veterinary diagnosis.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-[#ECFDF5] via-white to-[#F8FAFC] p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#0F766E]">Green</span>
                <span className="rounded-full bg-[#0F766E] px-2.5 py-1 text-xs font-medium text-white">Low concern</span>
              </div>
              <div className="mt-5 h-40 rounded-[1.5rem] bg-[radial-gradient(circle_at_center,_#a7f3d0,_#ecfdf5_40%,_#f8fafc_100%)] shadow-inner shadow-emerald-200/60" />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-100">
                  <span>Hair loss</span>
                  <span className="text-[#D97706]">Mild</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-100">
                  <span>Dryness</span>
                  <span className="text-[#0F766E]">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#0F766E] shadow-inner shadow-[#0F766E]/10">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
