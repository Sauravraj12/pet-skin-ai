"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Menu, X } from "lucide-react";

const navigationLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/demo", label: "Demo" },
  { href: "/history", label: "History" },
  { href: "/admin", label: "Admin" },
];

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative mb-8 flex items-center justify-between rounded-full border border-slate-200/80 bg-white/75 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2 text-slate-900">
        <span className="rounded-full bg-[#ECFDF5] p-2 text-[#0F766E] shadow-inner shadow-[#0F766E]/10">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">AI Pet Skin Check</span>
      </Link>

      <nav aria-label="Main navigation" className="hidden gap-5 text-sm font-medium text-slate-600 sm:flex">
        {navigationLinks.map(({ href, label }) => (
          <Link key={href} href={href} className="transition hover:text-[#0F766E]">
            {label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] sm:hidden"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full z-20 mt-3 grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 text-sm font-medium text-slate-700 shadow-xl sm:hidden"
        >
          {navigationLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-11 items-center rounded-xl px-3 transition hover:bg-[#ECFDF5] hover:text-[#0F766E] focus-visible:outline-2 focus-visible:outline-[#0F766E]"
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}