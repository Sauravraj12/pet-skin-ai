import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { getDatabase } from "@/lib/db";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  if (!(process.env.DATABASE_URL || process.env.DIRECT_URL)) {
    return NextResponse.json({
      success: false,
      message: "Database analytics are unavailable. Configure DATABASE_URL or DIRECT_URL.",
    }, { status: 503 });
  }

  try {
    const db = getDatabase();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalMembers, totalScreenings, green, yellow, red, unable, productClicks, activeThisMonth, clinics, veterinarians, followUpsCompleted] = await Promise.all([
      db.member.count({ where: { deletedAt: null } }),
      db.screeningSession.count(),
      db.screeningSession.count({ where: { overallRisk: "GREEN" } }),
      db.screeningSession.count({ where: { overallRisk: "YELLOW" } }),
      db.screeningSession.count({ where: { overallRisk: "RED" } }),
      db.screeningSession.count({ where: { overallRisk: "UNABLE_TO_DETERMINE" } }),
      db.productClick.count(),
      db.member.count({ where: { deletedAt: null, lastActiveAt: { gte: monthStart } } }),
      db.clinic.count(),
      db.veterinarian.count(),
      db.followUpReminder.count({ where: { completedAt: { not: null } } }),
    ]);

    const start = new Date();
    start.setDate(start.getDate() - 29);
    const screenings = await db.screeningSession.findMany({
      where: { screeningDate: { gte: start } },
      select: { screeningDate: true },
    });
    const screeningsByDay = Array.from({ length: 30 }, (_, index) => {
      const day = new Date(start);
      day.setHours(0, 0, 0, 0);
      day.setDate(start.getDate() + index);
      const key = day.toISOString().slice(0, 10);
      return {
        day: key,
        count: screenings.filter((item) => item.screeningDate.toISOString().slice(0, 10) === key).length,
      };
    });

    return NextResponse.json({
      totalMembers,
      totalScreenings,
      green,
      yellow,
      red,
      unable,
      productClicks,
      clickThroughRate: totalScreenings ? productClicks / totalScreenings : 0,
      activeThisMonth,
      clinics,
      veterinarians,
      followUpsCompleted,
      screeningsByDay,
    });
  } catch (error) {
    console.error("[admin/analytics] Database query failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({
      success: false,
      message: "Database analytics are temporarily unavailable.",
    }, { status: 503 });
  }
}
