/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/permissions/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    permission: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
  },
}));

describe("GET /api/permissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch permissions with default pagination", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.findMany.mockResolvedValue([]);
    prisma.permission.count.mockResolvedValue(0);

    const req = { url: "http://example.com/api/permissions" };

    const response = await GET(req);
    const body = await response.json();

    expect(isAuth).toHaveBeenCalled();
    expect(prisma.permission.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 25,
      orderBy: { createdAt: "desc" },
    });
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });
});

describe("POST /api/permissions", () => {
  it("should create a new permission", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.findFirst.mockResolvedValue(null);
    prisma.permission.create.mockResolvedValue({
      id: "1",
      name: "New Permission",
      method: "GET",
      route: "/new-permission",
      description: "A new test permission",
    });

    const req = {
      json: async () => ({
        name: "New Permission",
        method: "GET",
        route: "/new-permission",
        description: "A new test permission",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(prisma.permission.create).toHaveBeenCalled();
    expect(body.message).toEqual("Permission created successfully");
  });

  it("should prevent creating a permission with a duplicate route and method", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.findFirst.mockResolvedValue({
      id: "1",
      name: "Existing Permission",
      method: "GET",
      route: "/new-permission",
      description: "An existing permission",
    });

    const req = {
      json: async () => ({
        name: "New Permission",
        method: "GET",
        route: "/new-permission",
        description: "A new test permission",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toEqual("Permission already exist");
  });
});
