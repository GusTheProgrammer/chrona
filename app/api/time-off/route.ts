import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/time-off:
 *   post:
 *     tags:
 *       - Time Off
 *     summary: Submit a new time-off request
 *     description: Allows a user to submit a request for time off. The request must not overlap with any existing approved or pending requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate, shiftType]
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The starting date of the time-off request.
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The ending date of the time-off request.
 *               shiftType:
 *                 type: string
 *                 description: The type of shift or reason for the time-off request.
 *     responses:
 *       201:
 *         description: Time-off request created successfully.
 *       400:
 *         description: Input validation error, such as missing fields or invalid date ranges.
 *       500:
 *         description: Internal server error.
 *
 *   get:
 *     tags:
 *       - Time Off
 *     summary: Retrieve time-off requests
 *     description: Fetches time-off requests based on the role of the user making the request. Managers and Super Admins can view requests for their entire team, while other roles can only see their own requests.
 *     responses:
 *       200:
 *         description: Time-off requests fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the time-off request.
 *                   team:
 *                     type: string
 *                     description: The name of the team, if applicable.
 *                   empName:
 *                     type: string
 *                     description: The name of the employee requesting time off.
 *                   dateFrom:
 *                     type: string
 *                     format: date
 *                     description: Start date of the time off.
 *                   dateTo:
 *                     type: string
 *                     format: date
 *                     description: End date of the time off.
 *                   reason:
 *                     type: string
 *                     description: Reason for the time off.
 *                   status:
 *                     type: string
 *                     description: The current status of the request (e.g., approved, pending, denied).
 *       400:
 *         description: User ID is missing or invalid.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

export async function POST(req: Request) {
  try {
    await isAuth(req);

    const userId = req.headers.get("X-User-Id");
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      );
    }
    const { startDate, endDate, shiftType } = await req.json();

    // Validate input data (startDate, endDate, shiftType, and reason are required)
    if (!startDate || !endDate || !shiftType) {
      return new NextResponse(
        JSON.stringify({
          error: "startDate, endDate, shiftType, and reason are required",
        }),
        { status: 400 }
      );
    }

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

    // Fetch existing time-off requests that are pending or approved for this user
    const existingRequests = await prisma.timeOff.findMany({
      where: {
        userId: userId,
        AND: [
          {
            OR: [{ status: "pending" }, { status: "approved" }],
          },
          {
            AND: [
              {
                startDate: {
                  lte: new Date(endDate),
                },
              },
              {
                endDate: {
                  gte: new Date(startDate),
                },
              },
            ],
          },
        ],
      },
    });

    // Check if the new request dates clash with any existing requests
    if (existingRequests.length > 0) {
      return new NextResponse(
        JSON.stringify({
          error: "The requested dates clash with an existing time-off request.",
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
    await isAuth(req);
    const userId = req.headers.get("X-User-Id");

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
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

    let timeOffRequests;
    if (user.role.name === "Manager" || user.role.name === "Super Admin") {
      // Fetch time-off requests for everyone on the team
      timeOffRequests = await prisma.timeOff.findMany({
        where: {
          user: {
            teamId: user.teamId,
          },
        },
        include: {
          user: {
            include: { Team: true },
          },
        },
      });
    } else {
      // Fetch time-off requests only for the requesting user
      timeOffRequests = await prisma.timeOff.findMany({
        where: { userId: userId },
        include: {
          user: { include: { Team: true } },
        },
      });
    }

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
