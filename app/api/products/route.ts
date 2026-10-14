import { NextResponse } from "next/server";
import { productCatalog } from "@/lib/recommendation/recommendationEngine";

export async function GET() {
  const products = productCatalog.map((product) => ({ ...product, active: true }));
  return NextResponse.json({ products });
}
