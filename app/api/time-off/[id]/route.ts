import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await isAuth(req);

    const userId = params.id;
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      );
    }

    const holidays = await prisma.timeOff.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          include: {
            Team: true, // Assuming the Team relation exists as per your schema
          },
        },
      },
    });

    const holidayRequests = holidays.map((timeoff) => ({
      id: timeoff.id,
      team: timeoff.user.Team?.name || "", // Use the team name from the related Team record
      empName: timeoff.user.name,
      dateFrom: timeoff.startDate,
      dateTo: timeoff.endDate,
      reason: timeoff.reason,
      status: timeoff.status,
    }));

    return new NextResponse(JSON.stringify(holidayRequests), { status: 200 });
  } catch (error: any) {
    console.error("Error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
    });
  }
}
