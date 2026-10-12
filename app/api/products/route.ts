import { NextResponse } from "next/server";

const products = [
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
    active: true,
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
    active: true,
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
    active: true,
    tags: ["redness", "sensitive_skin", "immune_support"],
  },
];

export async function GET() {
  return NextResponse.json({ products });
}
