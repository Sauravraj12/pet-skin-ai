import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const screening = {
      id: `screening_${Date.now()}`,
      petName: body.petName || "Milo",
      species: body.species || "Dog",
      overallRisk: body.overallRisk || "YELLOW",
      summary: body.summary || "Visible skin indicators detected.",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, screening });
  } catch {
    return NextResponse.json({ success: false, message: "Screening creation failed." }, { status: 400 });
  }
}
