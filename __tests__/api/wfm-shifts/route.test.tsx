/**
 * @jest-environment node
 */
import { GET } from "@/app/api/wfm-shifts/route";
import { prisma } from "@/lib/prisma.db";
import { NextResponse } from "next/server";

// Mock the prisma client
jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    shiftType: {
      findMany: jest.fn(),
    },
  },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: () => Promise.resolve(data),
      status: options.status,
    })),
  },
}));

describe("GET /api/wfm-shifts", () => {
  it("should return 200 and a list of shift types", async () => {
    const mockShiftTypes = [
      { id: "1", name: "Morning", color: "blue" },
      { id: "2", name: "Evening", color: "orange" },
    ];
    prisma.shiftType.findMany.mockResolvedValue(mockShiftTypes);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockShiftTypes);
  });

  it("should return 404 when no shift types are found", async () => {
    prisma.shiftType.findMany.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "No shifts found" });
  });

  it("should return 500 on server error", async () => {
    const errorMessage = "Internal server error";
    prisma.shiftType.findMany.mockRejectedValue(new Error(errorMessage));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe(errorMessage);
  });
});
