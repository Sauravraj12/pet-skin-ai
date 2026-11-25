"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useSyncExternalStore } from "react";
import SiteHeader from "@/components/site-header";
import { productCatalog } from "@/lib/recommendation/recommendationEngine";
import {
  getCartSnapshot,
  getEmptyCartSnapshot,
  getCartTotal,
  subscribeToCart,
  updateCartItem,
} from "@/lib/storefront";

export default function CartPage() {
  const cart = useSyncExternalStore(subscribeToCart, getCartSnapshot, getEmptyCartSnapshot);
  const total = getCartTotal(cart, productCatalog);

  return (
    <main className="min-h-screen px-4 pb-16 pt-6 sm:px-6">
      <SiteHeader />
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-black">Shopping cart</h1>
        {cart.length ? (
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              {cart.map((item) => {
                const product = productCatalog.find((entry) => entry.id === item.productId);
                if (!product) return null;
                return (
                  <article key={item.productId} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF5] text-sm font-bold text-[#0F766E]">{product.category}</div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold">{product.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">${product.price.toFixed(2)} each</p>
                      <div className="mt-3 flex items-center gap-2">
                        <button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => updateCartItem(product.id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"><Minus className="h-4 w-4" /></button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => updateCartItem(product.id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"><Plus className="h-4 w-4" /></button>
                        <button type="button" aria-label={`Remove ${product.name}`} onClick={() => updateCartItem(product.id, 0)} className="ml-auto text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold">Order summary</h2>
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-lg font-black">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link href="/checkout" className="mt-5 flex rounded-full bg-[#0F766E] px-4 py-3 text-center text-sm font-semibold text-white">Proceed to checkout</Link>
            </aside>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-bold">Your cart is empty</h2>
            <Link href="/products" className="mt-4 inline-flex rounded-full bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white">Browse products</Link>
          </div>
        )}
      </section>
    </main>
  );
}
