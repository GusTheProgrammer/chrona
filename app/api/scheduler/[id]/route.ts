import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/scheduler/{id}:
 *   put:
 *     tags:
 *       - Scheduler
 *     summary: Update a scheduler shift
 *     description: Updates shift details for a specified scheduler ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the scheduler to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: JSON object containing the shift details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift_name:
 *                 type: string
 *                 description: The new name of the shift.
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: The starting time of the shift in ISO format.
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: The ending time of the shift in ISO format.
 *               shift_color:
 *                 type: string
 *                 description: The color code (e.g., HEX) for the shift.
 *     responses:
 *       200:
 *         description: Successfully updated the shift details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedShift:
 *                   $ref: '#/components/schemas/Shift'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error with input parameters or request body.
 *       404:
 *         description: No shift found for the given scheduler ID.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await isAuth(req, params);

    const userId = req.headers.get("X-User-Id");
    const schedulerId = params.id;

    if (!userId) {
      return getErrorResponse("User ID is required", 401);
    }

    if (!schedulerId) {
      return getErrorResponse("Scheduler ID is required", 400);
    }

    // Fetch user and associated role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return getErrorResponse("User not found", 404);
    }

    const scheduler = await prisma.schedulerCalendar.findUnique({
      where: { scheduler_id: schedulerId },
    });

    if (!scheduler) {
      return getErrorResponse(
        "Shift not found for the given Scheduler ID",
        404
      );
    }

    // Check if user is the owner of the shift or is a Manager/Super Admin
    if (
      scheduler.user_id !== userId &&
      user.role.name !== "Manager" &&
      user.role.name !== "Super Admin"
    ) {
      return getErrorResponse("Unauthorized to update this shift", 403);
    }

    const body = await req.json();
    const { shift_name, start_time, end_time, shift_color } = body;

    if (!scheduler.shift_id) {
      return getErrorResponse("Shift ID is required", 400);
    }

    // Update the shift record
    const updatedShift = await prisma.shift.update({
      where: { id: scheduler.shift_id },
      data: {
        name: shift_name,
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
