import { NextResponse } from "next/server";
import { z } from "zod";
import { productCatalog } from "@/lib/recommendation/recommendationEngine";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(2).max(20),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).max(10),
  })).min(1),
  total: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const body = checkoutSchema.parse(await request.json());
    const validItems = body.items.every((item) =>
      productCatalog.some((product) => product.id === item.productId && product.inStock),
    );
    if (!validItems) {
      return NextResponse.json({ success: false, message: "One or more cart items are unavailable." }, { status: 400 });
    }

    const serverTotal = body.items.reduce((sum, item) => {
      const product = productCatalog.find((entry) => entry.id === item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);
    if (Math.abs(serverTotal - body.total) > 0.01) {
      return NextResponse.json({ success: false, message: "The cart total changed. Please review your cart." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        status: "CONFIRMED",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Please complete all checkout fields correctly." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Checkout could not be completed." }, { status: 400 });
  }
}
