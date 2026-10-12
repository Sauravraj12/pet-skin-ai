import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "1. Capture a clear image",
    description: "Take a live photo or choose one from your gallery. Use good lighting and focus directly on the affected skin area.",
  },
  {
    icon: Sparkles,
    title: "2. AI preliminary screening",
    description: "The system checks the uploaded image for visible indicators like redness, scaling, dryness, hair loss, and irritation.",
  },
  {
    icon: CheckCircle2,
    title: "3. Get a risk summary",
    description: "You receive an easy-to-understand green, yellow, or red screening result with an explanation and recommended next steps.",
  },
  {
    icon: ShieldCheck,
    title: "4. Personalized guidance",
    description: "Review recommended wellness products and learn when veterinary consultation is appropriate for persistent or worsening skin concerns.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-16 pt-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between rounded-full border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
        <Link href="/" className="text-sm font-medium text-[#0F766E]">← Back Home</Link>
        <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
          How it works
        </span>
      </div>

      <section className="rounded-[2rem] bg-gradient-to-br from-white via-[#F8FAFC] to-[#ECFDF5] p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
            Simple 4-step process
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            How AI Pet Skin Check works
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            This is a preliminary screening tool designed to help pet owners quickly review visible skin indicators from a smartphone photo.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {steps.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#0F766E]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-[#0F766E]/20 bg-[#ECFDF5] p-5 text-sm text-slate-700">
          AI screening provides preliminary information based on the uploaded image and does not replace professional veterinary diagnosis.
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/check" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115e59]">
            Start Skin Check
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/demo" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#0F766E] hover:text-[#0F766E]">
            View Demo
          </Link>
        </div>
      </section>
    </main>
  );
}
