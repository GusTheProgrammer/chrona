import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await isAuth(req);

    const { userId, startDate, endDate, shiftType } = await req.json();

    // Validate input data (startDate, endDate, shiftType, and reason are required)
    if (!userId || !startDate || !endDate || !shiftType) {
      return new NextResponse(
        JSON.stringify({
          error:
            "userId, startDate, endDate, shiftType, and reason are required",
        }),
        { status: 400 }
      );
    }

    // Create the time-off request in the database
    await prisma.timeOff.create({
      data: {
        userId: userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: `${shiftType}`,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Time-off request created successfully",
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
    });
  }
}

export async function GET(req: Request) {
  try {
    // await isAuth(req);

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      );
    }

    const timeOffRequests = await prisma.timeOff.findMany({
      where: { userId: userId },
      include: {
        user: { include: { Team: true } },
      },
    });

    const formattedRequests = timeOffRequests.map((request) => ({
      id: request.id,
      team: request.user.Team?.name || "",
      empName: request.user.name,
      dateFrom: request.startDate,
      dateTo: request.endDate,
      reason: request.reason,
      status: request.status,
    }));

    return new NextResponse(JSON.stringify(formattedRequests), { status: 200 });
  } catch (error: any) {
    console.error("Error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
    });
  }
}
