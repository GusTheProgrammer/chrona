import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

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
