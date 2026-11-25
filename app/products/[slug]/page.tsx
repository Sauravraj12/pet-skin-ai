"use client";

import Link from "next/link";
import { use } from "react";
import { Check, ShoppingCart } from "lucide-react";
import SiteHeader from "@/components/site-header";
import { productCatalog } from "@/lib/recommendation/recommendationEngine";
import { addToCart } from "@/lib/storefront";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = productCatalog.find((item) => item.slug === slug);

  if (!product) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-6">
        <SiteHeader />
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-bold">Product not found</h1>
          <Link href="/products" className="mt-4 inline-flex rounded-full bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white">Browse products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6 sm:px-6">
      <SiteHeader />
      <section className="mx-auto grid max-w-5xl gap-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 sm:p-8">
        <div className="flex min-h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-slate-100">
          <ShoppingCart className="h-24 w-24 text-[#0F766E]" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">{product.category}</p>
          <h1 className="mt-2 text-3xl font-black">{product.name}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
          <ul className="mt-5 space-y-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 text-[#0F766E]" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-3xl font-black">${product.price.toFixed(2)} <span className="text-xs font-medium text-slate-500">{product.currency}</span></p>
          <p className="mt-1 text-xs font-semibold text-[#0F766E]">{product.inStock ? "In stock" : "Currently unavailable"}</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => addToCart(product.id)}
              className="flex-1 rounded-full bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to cart
            </button>
            <Link
              href="/cart"
              onClick={() => addToCart(product.id)}
              className="flex-1 rounded-full border border-[#0F766E] px-5 py-3 text-center text-sm font-semibold text-[#0F766E]"
            >
              Buy now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
