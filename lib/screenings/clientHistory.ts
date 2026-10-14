import type { ProductRecommendation } from "@/lib/recommendation/recommendationEngine";
import type { AnalysisResult } from "@/lib/validation/schemas";

export type StoredScreening = {
  id: string;
  petName: string;
  species: "Dog" | "Cat";
  createdAt: string;
  result: AnalysisResult;
  recommendations: ProductRecommendation[];
  productClicks?: { productId: string; clickedAt: string }[];
};

const historyKey = "pet-skin-screening-history";
const maxHistoryEntries = 30;
const historyChangedEvent = "pet-screening-history-changed";
const emptyHistory: StoredScreening[] = [];
let cachedStorageValue: string | null | undefined;
let cachedHistory = emptyHistory;

export function getScreeningHistory(): StoredScreening[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(historyKey);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as StoredScreening[] : [];
  } catch {
    return [];
  }
}

export function saveScreeningHistory(screening: StoredScreening): void {
  const history = getScreeningHistory().filter((item) => item.id !== screening.id);
  window.localStorage.setItem(historyKey, JSON.stringify([screening, ...history].slice(0, maxHistoryEntries)));
  window.dispatchEvent(new Event(historyChangedEvent));
}

export function getScreeningById(id: string): StoredScreening | undefined {
  return getScreeningHistory().find((screening) => screening.id === id);
}

export function subscribeToScreeningHistory(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", listener);
  window.addEventListener(historyChangedEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(historyChangedEvent, listener);
  };
}

export function getScreeningHistorySnapshot(): StoredScreening[] {
  if (typeof window === "undefined") return emptyHistory;
  const saved = window.localStorage.getItem(historyKey);
  if (saved === cachedStorageValue) return cachedHistory;

  cachedStorageValue = saved;
  try {
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    cachedHistory = Array.isArray(parsed) ? parsed as StoredScreening[] : emptyHistory;
  } catch {
    cachedHistory = emptyHistory;
  }
  return cachedHistory;
}

export function getEmptyScreeningHistorySnapshot(): StoredScreening[] {
  return emptyHistory;
}

export function recordProductClick(screeningId: string, productId: string): void {
  const history = getScreeningHistory();
  const index = history.findIndex((screening) => screening.id === screeningId);
  if (index < 0) return;

  const screening = history[index];
  history[index] = {
    ...screening,
    productClicks: [...(screening.productClicks || []), { productId, clickedAt: new Date().toISOString() }],
  };
  window.localStorage.setItem(historyKey, JSON.stringify(history));
  window.dispatchEvent(new Event(historyChangedEvent));
}
