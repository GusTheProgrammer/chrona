import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

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
