import { NextResponse } from "next/server";
import { z } from "zod";

const screeningInputSchema = z.object({
  petName: z.string().min(1),
  species: z.enum(["Dog", "Cat"]),
  overallRisk: z.enum(["GREEN", "YELLOW", "RED", "UNABLE_TO_DETERMINE"]),
  summary: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = screeningInputSchema.parse(await request.json());
    const screening = {
      id: crypto.randomUUID(),
      petName: body.petName,
      species: body.species,
      overallRisk: body.overallRisk,
      summary: body.summary,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, screening });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "A valid pet name, species, risk, and summary are required." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Screening creation failed." }, { status: 400 });
  }
}
