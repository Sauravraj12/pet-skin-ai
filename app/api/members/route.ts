import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const member = {
      id: `member_${Date.now()}`,
      name: body.name || "Guest",
      email: body.email || null,
      mobile: body.mobile || null,
      lineId: body.lineId || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, member });
  } catch {
    return NextResponse.json({ success: false, message: "Member creation failed." }, { status: 400 });
  }
}
