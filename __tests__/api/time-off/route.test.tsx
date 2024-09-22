/**
 * @jest-environment node
 */
import { POST, GET } from "@/app/api/time-off/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

// Mocks
jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    timeOff: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

// Tests
describe("POST /api/time-off", () => {
  it("should create a time-off request successfully", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.timeOff.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.timeOff.create as jest.Mock).mockResolvedValue({
      id: "123",
      userId: "u123",
      startDate: new Date("2024-12-25"),
      endDate: new Date("2024-12-30"),
      reason: "Holiday",
    });

    const req = {
      headers: new Map([["X-User-Id", "u123"]]),
      json: async () => ({
        startDate: "2024-12-25",
        endDate: "2024-12-30",
        shiftType: "Holiday",
      }),
    } as unknown as NextRequest;

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toEqual("Time-off request created successfully");
  });

  it("should return error when dates clash with existing requests", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.timeOff.findMany as jest.Mock).mockResolvedValue([
      {
        startDate: new Date("2024-12-24"),
        endDate: new Date("2024-12-26"),
        status: "approved",
      },
    ]);

    const req = {
      headers: new Map([["X-User-Id", "u123"]]),
      json: async () => ({
        startDate: "2024-12-25",
        endDate: "2024-12-30",
        shiftType: "Holiday",
      }),
    } as unknown as NextRequest;

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toEqual(
      "The requested dates clash with an existing time-off request."
    );
  });

  it("should return error if the start date is in the past", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const req = {
      headers: new Map([["X-User-Id", "u123"]]),
      json: async () => ({
        startDate: pastDate.toISOString().split("T")[0],
        endDate: "2024-12-30",
        shiftType: "Holiday",
      }),
    } as unknown as NextRequest;

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toEqual("Time-off requests must be for future dates.");
  });
});

describe("GET /api/time-off", () => {
  it("should fetch time-off requests for a regular user", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "u123",
      name: "John Doe",
      role: { name: "Employee" },
      teamId: "t123",
    });
    (prisma.timeOff.findMany as jest.Mock).mockResolvedValue([
      {
        id: "req1",
        user: {
          name: "John Doe",
          Team: { name: "Team A" },
        },
        startDate: new Date("2024-12-25"),
        endDate: new Date("2024-12-30"),
        reason: "Holiday",
        status: "approved",
      },
    ]);

    const req = {
      headers: new Map([["X-User-Id", "u123"]]),
    } as unknown as NextRequest;

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([
      {
        id: "req1",
        team: "Team A",
        empName: "John Doe",
        dateFrom: "2024-12-25T00:00:00.000Z",
        dateTo: "2024-12-30T00:00:00.000Z",
        reason: "Holiday",
        status: "approved",
      },
    ]);
  });

  it("should fetch time-off requests for the whole team when the user is a manager", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "u123",
      name: "Jane Manager",
      role: { name: "Manager" },
      teamId: "t123",
    });
    (prisma.timeOff.findMany as jest.Mock).mockResolvedValue([
      {
        id: "req1",
        user: {
          name: "John Doe",
          Team: { name: "Team A" },
        },
        startDate: new Date("2024-12-25"),
        endDate: new Date("2024-12-30"),
        reason: "Holiday",
        status: "approved",
      },
      {
        id: "req2",
        user: {
          name: "Alice Doe",
          Team: { name: "Team A" },
        },
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-05"),
        reason: "Vacation",
        status: "pending",
      },
    ]);

    const req = {
      headers: new Map([["X-User-Id", "u123"]]),
    } as unknown as NextRequest;

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.length).toBe(2); // Check if two requests are returned
    expect(body).toEqual(
      expect.arrayContaining([
        {
          id: "req1",
          team: "Team A",
          empName: "John Doe",
          dateFrom: "2024-12-25T00:00:00.000Z",
          dateTo: "2024-12-30T00:00:00.000Z",
          reason: "Holiday",
          status: "approved",
        },
        {
          id: "req2",
          team: "Team A",
          empName: "Alice Doe",
          dateFrom: "2025-01-01T00:00:00.000Z",
          dateTo: "2025-01-05T00:00:00.000Z",
          reason: "Vacation",
          status: "pending",
        },
      ])
    );
  });
});
