import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "AI Pet Skin Check",
    template: "%s | AI Pet Skin Check",
  },
  description: "Get a preliminary AI-assisted pet skin screening from a clear dog or cat photo. Fast guidance with veterinary safety reminders.",
  keywords: ["pet skin check", "dog skin screening", "cat skin screening", "AI pet health", "pet skin health"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "AI Pet Skin Check",
    description: "Preliminary AI-assisted skin screening for dogs and cats.",
    siteName: "AI Pet Skin Check",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8FAFC] text-slate-900">
        <div className="min-h-screen">
          <div className="mx-auto max-w-7xl">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
