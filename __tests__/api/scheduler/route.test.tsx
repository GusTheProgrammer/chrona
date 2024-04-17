/**
 * @jest-environment node
 */
import { GET } from "@/app/api/scheduler/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    schedulerCalendar: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
  },
}));

describe("GET /api/scheduler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch scheduler data with pagination and date filters", async () => {
    isAuth.mockResolvedValue(true);
    prisma.schedulerCalendar.findMany.mockResolvedValue([
      {
        datestamp: new Date("2024-01-01"),
        team_id: "team1",
        user_id: "user1",
        fullname: "John Doe",
      },
      // Add more mocked records as needed
    ]);

    const req = {
      url: "http://example.com/api/scheduler?teamId=team1&start=01-01-2024&end=31-01-2024&limit=10&page=1",
    };

    const response = await GET(req);
    const body = await response.json();

    expect(isAuth).toHaveBeenCalled();
    expect(prisma.schedulerCalendar.findMany).toHaveBeenCalledWith({
      where: {
        team_id: "team1",
        AND: [
          { datestamp: { gte: new Date("2024-01-01") } },
          { datestamp: { lte: new Date("2024-01-31") } },
        ],
      },
      orderBy: { datestamp: "asc" },
    });
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("should handle validation errors for missing team ID", async () => {
    const req = {
      url: "http://example.com/api/scheduler?start=01-01-2024&end=31-01-2024",
    };

    const response = await GET(req);
    const body = await response.json();

    expect(isAuth).toHaveBeenCalled();
    expect(body.error).toEqual("Team ID is required");
    expect(response.status).toBe(400);
  });

  it("should validate that start date must be before end date", async () => {
    const req = {
      url: "http://example.com/api/scheduler?teamId=team1&start=31-01-2024&end=01-01-2024",
    };

    const response = await GET(req);
    const body = await response.json();

    expect(body.error).toEqual("Start date must be before end date.");
    expect(response.status).toBe(400);
  });
});
