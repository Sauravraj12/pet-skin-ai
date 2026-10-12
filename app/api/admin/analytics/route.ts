import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalMembers: 124,
    totalScreenings: 318,
    green: 162,
    yellow: 99,
    red: 57,
    productClicks: 86,
    clickThroughRate: 0.27,
    screeningsByDay: [
      { day: "Mon", count: 30 },
      { day: "Tue", count: 42 },
      { day: "Wed", count: 55 },
      { day: "Thu", count: 48 },
      { day: "Fri", count: 61 },
      { day: "Sat", count: 57 },
      { day: "Sun", count: 25 },
    ],
  });
}
