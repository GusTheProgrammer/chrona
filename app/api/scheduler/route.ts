import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/scheduler:
 *   get:
 *     tags:
 *       - Scheduler
 *     summary: Fetch scheduler data for a specified team within a date range
 *     description: Retrieves paginated schedule records for a specific team, filtered by a date range and optionally by page number. Returns detailed scheduling data including user names and their schedules on specific dates.
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         description: Unique identifier of the team.
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         description: Number of records to return per page. Defaults to 7 if not specified.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         description: Page number for pagination. If not specified, the current page is determined based on today's date within the date range.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: start
 *         description: Start date of the range in DD-MM-YYYY format. Defaults to 1970-01-01 if not specified.
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end
 *         description: End date of the range in DD-MM-YYYY format. Defaults to 2999-12-31 if not specified.
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Successfully retrieved the scheduler data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 count:
 *                   type: integer
 *                 totalDates:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fullname:
 *                         type: string
 *                       schedule:
 *                         type: object
 *                         additionalProperties:
 *                           $ref: '#/components/schemas/ScheduleRecord'
 *                 columns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       accessorKey:
 *                         type: string
 *       400:
 *         description: Validation error with input parameters.
 *       500:
 *         description: Internal server error.
 */

// Helper function to parse dates in DD-MM-YYYY format
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function GET(req: Request) {
  try {
    await isAuth(req);

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const pageSize = parseInt(searchParams.get("limit") as string) || 7;
    const employeePageSize =
      parseInt(searchParams.get("employeeLimit") as string) || 10;
    const pageParam = searchParams.get("page");
    let page = parseInt(pageParam ?? "");
    const employeePageParam = searchParams.get("employeePage");
    let employeePage = parseInt(employeePageParam ?? "1");

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

    if (startDate > endDate) {
      return getErrorResponse("Start date must be before end date.", 400);
    }

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

    if (!pageParam) {
      const today = new Date().toISOString().split("T")[0];
      const currentIndex = allDates.indexOf(today);
      page = currentIndex >= 0 ? Math.floor(currentIndex / pageSize) + 1 : 1;
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

    const allEmployees = Array.from(recordsMap.values());
    const totalEmployees = allEmployees.length;
    const employeeStartIndex = (employeePage - 1) * employeePageSize;
    const employeeEndIndex = employeeStartIndex + employeePageSize;
    const paginatedEmployees = allEmployees.slice(
      employeeStartIndex,
      employeeEndIndex
    );

    const columns = [
      { accessorKey: "fullname" },
      ...pageDates.map((date) => ({ accessorKey: date })),
    ];

    return NextResponse.json({
      page,
      pageSize,
      employeePage,
      employeePageSize,
      count: paginatedEmployees.length,
      totalDates: allDates.length,
      totalEmployees,
      totalPages: Math.ceil(allDates.length / pageSize),
      totalEmployeePages: Math.ceil(totalEmployees / employeePageSize),
      data: paginatedEmployees,
      columns,
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
