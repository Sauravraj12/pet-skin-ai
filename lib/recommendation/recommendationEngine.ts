import type { AnalysisResult } from "@/lib/validation/schemas";

export type ProductRecommendation = {
  id: string;
  name: string;
  reason: string;
  rank: number;
  slug: string;
  description: string;
  imageUrl: string;
  category: string;
  price: number;
  currency: string;
  purchaseUrl: string;
};

const productCatalog = [
  {
    id: "prod_fur_skin_lecithin",
    name: "Fur & Skin Care Lecithin",
    slug: "fur-skin-care-lecithin",
    description: "A grooming-support product designed for skin and coat wellness.",
    imageUrl: "/products/lecithin.jpg",
    category: "Skin",
    price: 29,
    currency: "USD",
    purchaseUrl: "https://example.com/fur-skin-care-lecithin",
    tags: ["hair_loss", "dryness", "skin", "fur"],
  },
  {
    id: "prod_functional_egg_roll",
    name: "Functional Egg Roll",
    slug: "functional-egg-roll",
    description: "A general wellness product that supports skin and coat nourishment.",
    imageUrl: "/products/egg-roll.jpg",
    category: "Nutrition",
    price: 24,
    currency: "USD",
    purchaseUrl: "https://example.com/functional-egg-roll",
    tags: ["skin", "general_wellness", "nutrition"],
  },
  {
    id: "prod_hypoallergenic",
    name: "Hypoallergenic Immune Repair Formula",
    slug: "hypoallergenic-immune-repair-formula",
    description: "A supportive formula for sensitive or reactive skin conditions.",
    imageUrl: "/products/immune.jpg",
    category: "Immune",
    price: 34,
    currency: "USD",
    purchaseUrl: "https://example.com/hypoallergenic-immune-repair-formula",
    tags: ["redness", "sensitive_skin", "immune_support"],
  },
];

const map: Record<string, string[]> = {
  DRYNESS: ["prod_fur_skin_lecithin"],
  HAIR_LOSS: ["prod_fur_skin_lecithin", "prod_functional_egg_roll"],
  REDNESS: ["prod_hypoallergenic"],
  SENSITIVE_SKIN: ["prod_hypoallergenic"],
  SCALING: ["prod_fur_skin_lecithin"],
  MILD_GENERAL_SKIN_CONCERN: ["prod_functional_egg_roll"],
};

export function getRecommendedProducts(result: AnalysisResult): ProductRecommendation[] {
  const indicators = result.visibleIndicators.map((indicator) => indicator.code);
  const selected: ProductRecommendation[] = [];

  const productIds = new Set<string>();
  for (const code of indicators) {
    const ids = map[code] || [];
    ids.forEach((id) => productIds.add(id));
  }

  if (productIds.size === 0) {
    productIds.add("prod_functional_egg_roll");
  }

  const ordered = productCatalog.filter((product) => productIds.has(product.id));
  ordered.forEach((product, index) => {
    const reason = `Recommended based on detected ${indicators.join(", ") || "general skin concern"}.`;
    selected.push({
      ...product,
      reason,
      rank: index + 1,
    });
  });

  return selected;
}
