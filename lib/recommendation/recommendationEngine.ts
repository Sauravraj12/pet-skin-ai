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

type CatalogProduct = Omit<ProductRecommendation, "reason" | "rank"> & {
  suitableSpecies: ("Dog" | "Cat")[];
  tags: string[];
};

export const productCatalog: CatalogProduct[] = [
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
    suitableSpecies: ["Dog", "Cat"],
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
    suitableSpecies: ["Dog", "Cat"],
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
    suitableSpecies: ["Dog", "Cat"],
    tags: ["redness", "sensitive_skin", "immune_support"],
  },
];

const map: Record<string, string[]> = {
  DRYNESS: ["prod_fur_skin_lecithin"],
  HAIR_LOSS: ["prod_fur_skin_lecithin", "prod_functional_egg_roll"],
  REDNESS: ["prod_hypoallergenic"],
  DANDRUFF: ["prod_fur_skin_lecithin"],
  IRRITATION: ["prod_hypoallergenic"],
  SENSITIVE_SKIN: ["prod_hypoallergenic"],
  SCALING: ["prod_fur_skin_lecithin"],
  MILD_GENERAL_SKIN_CONCERN: ["prod_functional_egg_roll"],
};

export function getRecommendedProducts(result: AnalysisResult): ProductRecommendation[] {
  if (result.overallRisk === "RED" || result.overallRisk === "UNABLE_TO_DETERMINE") return [];

  const indicators = result.visibleIndicators.map((indicator) => indicator.code.trim().toUpperCase().replace(/[\s-]+/g, "_"));
  const matchedIds = result.overallRisk === "GREEN"
    ? productCatalog.filter((product) => product.tags.includes("general_wellness")).map((product) => product.id)
    : [...new Set(indicators.flatMap((code) => map[code] || []))];

  return productCatalog
    .filter((product) => matchedIds.includes(product.id) && product.suitableSpecies.includes(result.petSpecies))
    .map((product, index) => {
      const matchedConcerns = indicators.filter((code) => (map[code] || []).includes(product.id));
      return {
        ...product,
        reason: result.overallRisk === "GREEN"
          ? "General skin and coat care for routine wellness."
          : `Selected for the detected ${matchedConcerns.join(", ").toLowerCase().replaceAll("_", " ")} concern(s).`,
        rank: index + 1,
      };
    });
}
