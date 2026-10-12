import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      ...body,
      timestamp: new Date().toISOString(),
      success: true,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ success: false, message: "Failed to record product click." }, { status: 400 });
  }
}
