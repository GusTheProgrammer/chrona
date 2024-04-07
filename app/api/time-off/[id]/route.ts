import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";

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

    // Fetch wfmShifts (ShiftTypes)
    const wfmShifts = await prisma.shiftType.findMany();

    const shiftType = timeOffRequest.reason || "Default Shift Type";
    const shiftColor =
      wfmShifts.find((shift) => shift.name === shiftType)?.color || "";

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
    if (timeOffRequest.status === "approved") {
      return new NextResponse(
        JSON.stringify({
          error: "Approved time-off requests cannot be edited",
        }),
        { status: 400 }
      );
    }

    const { startDate, endDate, shiftType } = await req.json();

    // Ensure the requested dates are in the future
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize current date to start of day for comparison
    if (new Date(startDate) < currentDate) {
      return new NextResponse(
        JSON.stringify({
          error: "Time-off requests must be for future dates.",
        }),
        { status: 400 }
      );
    }

    if (timeOffRequest.status === "declined") {
      // Fetch existing time-off requests that clash with the new dates
      const existingRequests = await prisma.timeOff.findMany({
        where: {
          userId: userId,
          AND: [
            {
              OR: [{ status: "pending" }, { status: "approved" }],
            },
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(startDate) } },
              ],
            },
          ],
        },
      });

      if (existingRequests.length > 0) {
        return new NextResponse(
          JSON.stringify({
            error:
              "The requested dates clash with an existing time-off request.",
          }),
          { status: 400 }
        );
      }

      // Create a new request with "pending" status
      await prisma.timeOff.create({
        data: {
          userId: userId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason: shiftType,
          status: "pending", // Set the new request to "pending"
        },
      });
      return new NextResponse(
        JSON.stringify({
          message: "New time-off request created with pending status",
        }),
        { status: 201 }
      );
    } else {
      // If the request is neither approved nor denied, allow updates
      await prisma.timeOff.update({
        where: { id: timeOffId },
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason: shiftType, // Directly assignable
        },
      });
      return new NextResponse(
        JSON.stringify({ message: "TimeOff request updated successfully" }),
        { status: 200 }
      );
    }
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
