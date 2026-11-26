import { NextResponse } from "next/server";
import { z } from "zod";
import { productClickSchema } from "@/lib/validation/schemas";
import { getDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = productClickSchema.parse(await request.json());
    let persisted = false;
    if (process.env.DATABASE_URL || process.env.DIRECT_URL) {
      try {
        const db = getDatabase();
        await db.productClick.create({
          data: {
            productId: body.productId,
            screeningSessionId: body.screeningSessionId || null,
            source: body.source,
            userAgent: body.userAgent || request.headers.get("user-agent"),
            referrer: body.referrer || request.headers.get("referer"),
          },
        });
        persisted = true;
      } catch (error) {
        console.error("[analytics/product-click] Database write failed", error instanceof Error ? error.message : "unknown error");
      }
    }
    const payload = {
      ...body,
      timestamp: new Date().toISOString(),
      success: true,
      persisted,
    };

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "A valid product click event is required." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to record product click." }, { status: 400 });
  }
}
