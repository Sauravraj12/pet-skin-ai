import Link from "next/link";
import { ArrowRight, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/check", label: "Skin Check" },
  { href: "/history", label: "History" },
  { href: "/admin", label: "Admin" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0f172a] text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_30%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-7">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#0F766E] shadow-inner shadow-[#0F766E]/10">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">AI Pet Skin Check</p>
                  <p className="text-xs text-slate-300">Preliminary screening support</p>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                AI-assisted skin monitoring for early signs of irritation, redness, and unusual patterns.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Explore</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                {footerLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="flex items-center gap-2 transition hover:text-[#5eead4]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4">
              <div className="flex items-center gap-2 text-emerald-300">
                <Stethoscope className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Care note</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                This tool supports early awareness and is not a substitute for a veterinary diagnosis.
              </p>
              <Link href="/check" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-100">
                Start check
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 AI Pet Skin Check. All rights reserved.</p>
            <div className="flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Privacy-aware care</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
