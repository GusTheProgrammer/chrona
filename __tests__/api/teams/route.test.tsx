/**
 * @jest-environment node
 */
import { GET } from "@/app/api/teams/route";
import { prisma } from "@/lib/prisma.db"; // Ensure this path matches your actual import
import { NextResponse, NextRequest } from "next/server";

// Mock the prisma client
jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    team: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/teams", () => {
  it("should return 200 and a list of teams", async () => {
    const mockTeams = [
      { id: "1", name: "Team A", description: "A great team" },
    ];
    (prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

    const req = {} as NextRequest;
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockTeams);
  });

  it("should return 404 when no teams are found", async () => {
    (prisma.team.findMany as jest.Mock).mockResolvedValue([]);

    const req = {} as NextRequest;
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: "No teams found" });
  });

  it("should return 500 on server error", async () => {
    (prisma.team.findMany as jest.Mock).mockRejectedValue(new Error("Internal server error"));

    const req = {} as NextRequest;
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
