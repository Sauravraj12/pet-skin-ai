import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    totalMembers: 0,
    totalScreenings: 0,
    green: 0,
    yellow: 0,
    red: 0,
    productClicks: 0,
    clickThroughRate: 0,
    screeningsByDay: [],
  });
}
