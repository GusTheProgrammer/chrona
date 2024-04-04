import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import wfmShifts from "@/config/wfmShifts";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // await isAuth(req);

    const userId = req.headers.get("X-User-Id");

    const timeOffId = params.id;

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "invalid user ID or not found" }),
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }
    console.log("role name", user.role.name);

    if (user.role.name !== "Manager" && user.role.name !== "Super Admin") {
      return new NextResponse(
        JSON.stringify({
          error: `You are not authorized to approve time off requests. | ${user.role.name}`,
        }),
        { status: 403 }
      );
    }
    const { isApproved } = await req.json();

    if (typeof isApproved !== "boolean") {
      return new NextResponse(
        JSON.stringify({
          error: "isApproved is required",
        }),
        { status: 400 }
      );
    }

    // Fetch the timeOff request from the DB
    const timeOffRequest = await prisma.timeOff.findUnique({
      where: { id: timeOffId },
    });

    if (!timeOffRequest) {
      return new NextResponse(
        JSON.stringify({ error: "TimeOff request not found" }),
        { status: 404 }
      );
    }

    // Update the timeOff request status
    await prisma.timeOff.update({
      where: { id: timeOffId },
      data: {
        status: isApproved ? "approved" : "declined",
      },
    });

    const shiftType = timeOffRequest.reason || "Default Shift Type";
    const shiftColor =
      wfmShifts.find((shift) => shift.shift_name === shiftType)?.color || "";

    if (isApproved) {
      const schedulersToUpdate = await prisma.scheduler.findMany({
        where: {
          userId: userId,
          date: {
            gte: timeOffRequest.startDate,
            lte: timeOffRequest.endDate,
          },
        },
      });

      const updates = schedulersToUpdate.map((scheduler) =>
        prisma.shift.update({
          where: { id: scheduler.shiftId },
          data: { name: shiftType, color: shiftColor },
        })
      );

      await Promise.all(updates);
    }

    return new NextResponse(
      JSON.stringify({
        message: `TimeOff request ${
          isApproved ? "approved" : "declined"
        } successfully`,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
    });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // await isAuth(req);

    const userId = req.headers.get("X-User-Id");

    // Fetching new time-off details along with userId from the request body
    const timeOffId = params.id;

    // Verify if the userId is provided in the JSON body
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid user ID or not found" }),
        { status: 401 }
      );
    }

    // Fetch the timeOff request to ensure the user is tied to this request and the request exists
    const timeOffRequest = await prisma.timeOff.findUnique({
      where: { id: timeOffId },
    });

    if (!timeOffRequest) {
      return new NextResponse(
        JSON.stringify({ error: "TimeOff request not found" }),
        { status: 404 }
      );
    }

    // Check if the user making the request is the same as the one tied to the time-off request
    if (timeOffRequest.userId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized to edit this time-off request" }),
        { status: 403 }
      );
    }

    const { startDate, endDate, reason } = await req.json();

    // Update the timeOff request details
    await prisma.timeOff.update({
      where: { id: timeOffId },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason, // Assuming 'reason' is directly assignable
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "TimeOff request updated successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
    });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // await isAuth(req);

    const userId = req.headers.get("X-User-Id");

    const timeOffId = params.id;

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        { status: 401 }
      );
    }

    const timeOffRequest = await prisma.timeOff.findUnique({
      where: { id: timeOffId },
    });

    if (!timeOffRequest) {
      return new NextResponse(
        JSON.stringify({ error: "TimeOff request not found" }),
        { status: 404 }
      );
    }

    // Check if the request is created by the user attempting to delete it
    if (timeOffRequest.userId !== userId) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized to delete this time-off request",
        }),
        { status: 403 }
      );
    }

    // Ensure the request can only be deleted if its status is 'pending'
    if (timeOffRequest.status !== "pending") {
      return new NextResponse(
        JSON.stringify({
          error: "Only pending time-off requests can be deleted",
        }),
        { status: 400 }
      );
    }

    // Delete the timeOff request
    await prisma.timeOff.delete({
      where: { id: timeOffId },
    });

    return new NextResponse(
      JSON.stringify({ message: "TimeOff request deleted successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
    });
  }
}
