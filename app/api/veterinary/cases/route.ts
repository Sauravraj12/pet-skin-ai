import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

function authorized(request: Request): boolean {
  const secret = process.env.VETERINARIAN_SECRET;
  const authorization = request.headers.get("authorization") || "";
  const [scheme, credential] = authorization.split(" ");
  return Boolean(secret && !secret.startsWith("replace-with") && scheme?.toLowerCase() === "bearer" && credential === secret);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, message: "Veterinarian authorization required." }, { status: 401 });
  }
  if (!(process.env.DATABASE_URL || process.env.DIRECT_URL)) {
    return NextResponse.json({ success: false, message: "Database is not configured." }, { status: 503 });
  }

  try {
    const db = getDatabase();
    const cases = await db.screeningSession.findMany({
      include: {
        pet: { select: { id: true, name: true, species: true, breed: true, age: true, weight: true } },
        indicators: true,
        caseReviews: true,
      },
      orderBy: { screeningDate: "desc" },
      take: 100,
    });
    return NextResponse.json({
      success: true,
      cases: cases.map((item) => ({
        id: item.id,
        screeningDate: item.screeningDate,
        overallRisk: item.overallRisk,
        imageQuality: item.imageQuality,
        summary: item.summary,
        status: item.status,
        pet: item.pet,
        indicators: item.indicators,
        reviews: item.caseReviews,
      })),
    });
  } catch (error) {
    console.error("[veterinary/cases] Database query failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, message: "Case records are temporarily unavailable." }, { status: 503 });
  }
}
