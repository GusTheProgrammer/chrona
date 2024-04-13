import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/wfm-shifts:
 *   get:
 *     tags:
 *       - WFM Shifts
 *     summary: Retrieve all shift types
 *     description: Fetches a list of all shift types from the database. Returns details including id, name, and color.
 *     responses:
 *       200:
 *         description: A list of shift types retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the shift type.
 *                   name:
 *                     type: string
 *                     description: The name of the shift type.
 *                   color:
 *                     type: string
 *                     description: The color associated with the shift type, used in scheduling UIs.
 *       404:
 *         description: No shifts found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No shifts found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Detailed error message.
 */
export async function GET(req: Request) {
  try {
    const wfmShifts = await prisma.shiftType.findMany({
      select: {
        id: true,
        name: true,
        color: true,
      },
    });
    if (!wfmShifts.length) {
      return new NextResponse(JSON.stringify({ message: "No shifts found" }), {
        status: 404,
      });
    }
    return new NextResponse(JSON.stringify(wfmShifts), { status: 200 });
  } catch (error: any) {
    // Log and return the error if any occurs during the process.
    console.error("Error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
    });
  }
}
