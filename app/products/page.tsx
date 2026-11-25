import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import SiteHeader from "@/components/site-header";
import { productCatalog } from "@/lib/recommendation/recommendationEngine";

export default function ProductsPage() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-6 sm:px-6">
      <SiteHeader />
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">Pet care shop</p>
          <h1 className="mt-2 text-3xl font-black">Skin and coat support</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Browse wellness products. Recommendations are educational and should not replace veterinary care.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {productCatalog.map((product) => (
            <article key={product.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-36 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-slate-100 text-[#0F766E]">
                <ShoppingBag className="h-12 w-12" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{product.category}</p>
              <h2 className="mt-1 text-lg font-bold">{product.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                <Link href={`/products/${product.slug}`} className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white">
                  View product
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
