"use client";

import type { CatalogProduct } from "@/lib/recommendation/recommendationEngine";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type StoreOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  email: string;
  items: CartItem[];
  total: number;
  status: "CONFIRMED";
};

const cartKey = "pet-skin-cart";
const ordersKey = "pet-skin-orders";
const cartChangedEvent = "pet-skin-cart-changed";
const emptyCart: CartItem[] = [];
let cachedStorageValue: string | null | undefined;
let cachedCart = emptyCart;

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return emptyCart;
  const saved = window.localStorage.getItem(cartKey);
  if (saved === cachedStorageValue) return cachedCart;

  cachedStorageValue = saved;
  try {
    const parsed = JSON.parse(saved || "[]") as unknown;
    cachedCart = Array.isArray(parsed) ? parsed as CartItem[] : emptyCart;
  } catch {
    cachedCart = emptyCart;
  }
  return cachedCart;
}

export function subscribeToCart(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", listener);
  window.addEventListener(cartChangedEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(cartChangedEvent, listener);
  };
}

export function updateCartItem(productId: string, quantity: number): void {
  const cart = getCart().filter((item) => item.productId !== productId);
  if (quantity > 0) cart.push({ productId, quantity: Math.min(quantity, 10) });
  window.localStorage.setItem(cartKey, JSON.stringify(cart));
  window.dispatchEvent(new Event(cartChangedEvent));
}

export function addToCart(productId: string, quantity = 1): void {
  const current = getCart().find((item) => item.productId === productId);
  updateCartItem(productId, (current?.quantity || 0) + quantity);
}

export function clearCart(): void {
  window.localStorage.setItem(cartKey, "[]");
  window.dispatchEvent(new Event(cartChangedEvent));
}

export function getCartSnapshot(): CartItem[] {
  return getCart();
}

export function getEmptyCartSnapshot(): CartItem[] {
  return emptyCart;
}

export function saveOrder(order: StoreOrder): void {
  const saved = window.localStorage.getItem(ordersKey);
  const orders = saved ? JSON.parse(saved) as StoreOrder[] : [];
  window.localStorage.setItem(ordersKey, JSON.stringify([order, ...orders].slice(0, 20)));
}

export function getOrders(): StoreOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ordersKey) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed as StoreOrder[] : [];
  } catch {
    return [];
  }
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(cart: CartItem[], catalog: CatalogProduct[]): number {
  return cart.reduce((sum, item) => {
    const product = catalog.find((entry) => entry.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);
}
