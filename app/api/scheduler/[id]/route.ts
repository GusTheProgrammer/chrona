import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await isAuth(req, params);

    const schedulerId = params.id;

    if (!schedulerId) {
      return getErrorResponse("Scheduler ID is required", 400);
    }

    // Fetch the corresponding shift ID from the SchedulerCalendar view
    const scheduler = await prisma.schedulerCalendar.findUnique({
      where: { scheduler_id: schedulerId },
    });

    if (!scheduler || !scheduler.shift_id) {
      return getErrorResponse(
        "Shift not found for the given Scheduler ID",
        404
      );
    }

    const body = await req.json();
    const { shift_name, shift_code, start_time, end_time, shift_color } = body;

    // Update the shift record
    const updatedShift = await prisma.shift.update({
      where: { id: scheduler.shift_id },
      data: {
        name: shift_name,
        code: shift_code,
        startTime: new Date(start_time),
        endTime: new Date(end_time),
        color: shift_color,
      },
    });

    return NextResponse.json({
      updatedShift,
      message: "Shift updated successfully",
    });
  } catch ({ status = 500, message }: any) {
    console.error("Error:", message); // Debug log
    return getErrorResponse(message, status);
  }
}
