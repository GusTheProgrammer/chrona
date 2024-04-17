import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

// Helper function to parse dates in DD-MM-YYYY format
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const pageSize = parseInt(searchParams.get("limit") as string) || 7;
    const pageParam = searchParams.get("page");
    let page = parseInt(pageParam);
    const startDateParam = searchParams.get("start");
    const endDateParam = searchParams.get("end");
    if (!teamId) {
      return getErrorResponse("Team ID is required", 400);
    }

    const startDate = startDateParam
      ? parseDate(startDateParam)
      : new Date("1970-01-01");
    const endDate = endDateParam
      ? parseDate(endDateParam)
      : new Date("2999-12-31");

    // Validation: Ensure start date is before end date
    if (startDate > endDate) {
      return getErrorResponse("Start date must be before end date.", 400);
    }

    // Fetch all records within the date range for the team
    const records = await prisma.schedulerCalendar.findMany({
      where: {
        team_id: teamId,
        AND: [
          { datestamp: { gte: startDate } },
          { datestamp: { lte: endDate } },
        ],
      },
      orderBy: { datestamp: "asc" },
    });

    const allDates = Array.from(
      new Set(
        records.map((record) => record.datestamp.toISOString().split("T")[0])
      )
    ).sort();

    // Determine the current page based on today's date within the filtered range, if page is not explicitly specified
    if (!pageParam) {
      const today = new Date().toISOString().split("T")[0];
      const currentIndex = allDates.indexOf(today);
      page = currentIndex >= 0 ? Math.floor(currentIndex / pageSize) + 1 : 1; // Ensure page is at least 1
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageDates = allDates.slice(startIndex, endIndex);

    const recordsMap = new Map();

    records.forEach((record) => {
      const date = record.datestamp.toISOString().split("T")[0];
      const { fullname, user_id } = record;

      if (!recordsMap.has(user_id)) {
        recordsMap.set(user_id, { fullname });
      }

      if (pageDates.includes(date)) {
        recordsMap.get(user_id)[date] = record;
      }
    });

    const paginatedData = Array.from(recordsMap.values());

    const columns = [
      { accessorKey: "fullname" },
      ...pageDates.map((date) => ({ accessorKey: date })),
    ];

    return NextResponse.json({
      page,
      pageSize,
      count: paginatedData.length,
      totalDates: allDates.length,
      totalPages: Math.ceil(allDates.length / pageSize),
      data: paginatedData,
      columns,
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
