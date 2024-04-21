import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/teams:
 *   get:
 *     tags:
 *       - Teams
 *     summary: Retrieve all teams
 *     description: Fetches a list of all teams from the database. If no teams are found, returns a message indicating no teams are available.
 *     responses:
 *       200:
 *         description: A list of teams retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique identifier of the team.
 *                   name:
 *                     type: string
 *                     description: The name of the team.
 *                   description:
 *                     type: string
 *                     description: A brief description of the team.
 *       404:
 *         description: No teams found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No teams found"
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
    // Fetch all teams from the database.
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        // Include other fields you might need
      },
    });

    // If no teams found, you can decide to return an empty array or a message.
    if (!teams.length) {
      return new NextResponse(JSON.stringify({ message: "No teams found" }), {
        status: 404,
      });
    }

    // Return the fetched teams with a 200 OK status.
    return new NextResponse(JSON.stringify(teams), { status: 200 });
  } catch (error: any) {
    // Log and return the error if any occurs during the process.
    console.error("Error:", error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
    });
  }
}
