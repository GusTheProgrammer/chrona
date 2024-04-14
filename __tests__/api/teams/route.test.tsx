/**
 * @jest-environment node
 */
import { GET } from "@/app/api/teams/route";
import { prisma } from "@/lib/prisma.db"; // Ensure this path matches your actual import
import { NextResponse } from "next/server";

// Mock the prisma client
jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    team: {
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

describe("GET /api/teams", () => {
  it("should return 200 and a list of teams", async () => {
    const mockTeams = [
      { id: "1", name: "Team A", description: "A great team" },
    ];
    prisma.team.findMany.mockResolvedValue(mockTeams);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockTeams);
  });

  it("should return 404 when no teams are found", async () => {
    prisma.team.findMany.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "No teams found" });
  });

  it("should return 500 on server error", async () => {
    prisma.team.findMany.mockRejectedValue(new Error("Internal server error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
