import { NextResponse } from "next/server";
import { z } from "zod";
import { productClickSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = productClickSchema.parse(await request.json());
    const payload = {
      ...body,
      timestamp: new Date().toISOString(),
      success: true,
    };

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "A valid product click event is required." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to record product click." }, { status: 400 });
  }
}
