import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/scheduler/batch-update:
 *   put:
 *     tags:
 *       - Scheduler
 *     summary: Batch update scheduler shifts
 *     description: Updates shift details for multiple scheduler entries.
 *     requestBody:
 *       description: JSON array containing objects with scheduler IDs and their updated shift details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - id
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the scheduler to update.
 *                 shift_name:
 *                   type: string
 *                   description: The new name of the shift.
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *                   description: The starting time of the shift in ISO format.
 *                 end_time:
 *                   type: string
 *                   format: date-time
 *                   description: The ending time of the shift in ISO format.
 *                 shift_color:
 *                   type: string
 *                   description: The color code (e.g., HEX) for the shift.
 *     responses:
 *       200:
 *         description: Successfully updated the shift details.
 *       400:
 *         description: Validation error with input parameters or request body.
 *       403:
 *         description: Unauthorized to update one or more specified shifts.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(req: Request) {
  try {
    const userId = req.headers.get("X-User-Id");
    if (!userId) {
      return getErrorResponse("User ID is required", 401);
    }

    // Fetch user and associated role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return getErrorResponse("User not found", 404);
    }

    const updates = await req.json();
    if (!Array.isArray(updates)) {
      return getErrorResponse(
        "Invalid request body: expected an array of updates",
        400
      );
    }

    // Fetch all schedulers once to reduce database calls
    const allSchedulers = await prisma.schedulerCalendar.findMany({
      where: {
        scheduler_id: { in: updates.map((u) => u.id) },
      },
    });

    // Create a map for quick access
    const schedulerMap = new Map(allSchedulers.map((s) => [s.scheduler_id, s]));

    // Prepare batch update without wrapping in async functions
    const updateOperations = updates.map((update) => {
      const scheduler = schedulerMap.get(update.id);

      if (!scheduler) {
        throw new Error(`Shift not found for the given ID: ${update.id}`);
      }

      if (
        scheduler.user_id !== userId &&
        user.role.name !== "Manager" &&
        user.role.name !== "Super Admin"
      ) {
        throw new Error(`Unauthorized to update shift with ID: ${update.id}`);
      }

      // Directly return the Prisma promise
      return prisma.shift.update({
        where: { id: scheduler.shift_id },
        data: {
          name: update.shift_name,
          startTime: new Date(update.start_time),
          endTime: new Date(update.end_time),
          color: update.shift_color,
        },
      });
    });

    // Perform the transaction
    await prisma.$transaction(updateOperations);

    return NextResponse.json({
      message: "Batch shift update successful",
    });
  } catch (error: any) {
    console.error("Batch Update Error:", error.message);
    return getErrorResponse(error.message, error.status || 500);
  }
}
