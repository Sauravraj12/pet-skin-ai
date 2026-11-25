"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useSyncExternalStore } from "react";
import SiteHeader from "@/components/site-header";
import { productCatalog } from "@/lib/recommendation/recommendationEngine";
import { clearCart, getCartSnapshot, getEmptyCartSnapshot, getCartTotal, saveOrder, subscribeToCart } from "@/lib/storefront";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useSyncExternalStore(subscribeToCart, getCartSnapshot, getEmptyCartSnapshot);
  const total = getCartTotal(cart, productCatalog);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length) return;
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const body = {
      customerName: String(form.get("customerName") || ""),
      email: String(form.get("email") || ""),
      address: String(form.get("address") || ""),
      city: String(form.get("city") || ""),
      postalCode: String(form.get("postalCode") || ""),
      items: cart,
      total,
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json() as { success: boolean; order?: { id: string; createdAt: string; status: "CONFIRMED" }; message?: string };
      if (!response.ok || !payload.success || !payload.order) throw new Error(payload.message || "Could not place the order.");

      saveOrder({
        id: payload.order.id,
        createdAt: payload.order.createdAt,
        customerName: body.customerName,
        email: body.email,
        items: cart,
        total,
        status: payload.order.status,
      });
      clearCart();
      router.push(`/order-confirmation?id=${encodeURIComponent(payload.order.id)}&total=${encodeURIComponent(total.toFixed(2))}`);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not place the order.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6 sm:px-6">
      <SiteHeader />
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-black">Checkout</h1>
        {!cart.length ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p>Your cart is empty.</p>
            <Link href="/products" className="mt-4 inline-flex rounded-full bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white">Browse products</Link>
          </div>
        ) : (
          <form onSubmit={placeOrder} className="mt-5 grid gap-5 md:grid-cols-[1fr_280px]">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold">Delivery details</h2>
              {[
                ["customerName", "Full name", "text"],
                ["email", "Email address", "email"],
                ["address", "Street address", "text"],
                ["city", "City", "text"],
                ["postalCode", "Postal code", "text"],
              ].map(([name, label, type]) => (
                <label key={name} className="block text-sm font-semibold text-slate-700">
                  {label}
                  <input name={name} type={type} required className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10" />
                </label>
              ))}
              <div className="rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                Demo checkout: no card details are collected and no real charge is made.
              </div>
              {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            </div>
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold">Order total</h2>
              <p className="mt-4 border-t border-slate-100 pt-4 text-2xl font-black">${total.toFixed(2)}</p>
              <button type="submit" disabled={submitting} className="mt-5 w-full rounded-full bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {submitting ? "Placing order..." : "Place demo order"}
              </button>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}
