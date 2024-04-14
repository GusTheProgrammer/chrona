/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/client-permissions/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    clientPermission: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

jest.mock("@/lib/helpers", () => ({
  getErrorResponse: jest.fn().mockImplementation((message, status) => {
    return { error: message, status };
  }),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
  },
}));

describe("GET /api/client-permissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch client permissions successfully", async () => {
    const mockPermissions = [{ id: "1", name: "View Dashboard" }];
    prisma.clientPermission.findMany.mockResolvedValue(mockPermissions);
    prisma.clientPermission.count.mockResolvedValue(1);

    const req = {
      url: "http://localhost/api/client-permissions?page=1&limit=1",
      method: "GET",
    };

    const response = await GET(req);
    const body = await response.json();

    expect(prisma.clientPermission.findMany).toHaveBeenCalled();
    expect(body.data).toEqual(mockPermissions);
    expect(body.total).toEqual(1);
  });

  it("should handle errors when fetching permissions", async () => {
    prisma.clientPermission.findMany.mockRejectedValue(
      new Error("Failed to fetch data")
    );

    const req = { url: "http://localhost/api/client-permissions" };

    const response = await GET(req);

    expect(response.status).toBe(500);
    expect(response.error).toBeDefined();
  });
});

describe("POST /api/client-permissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a client permission successfully", async () => {
    prisma.clientPermission.findFirst.mockResolvedValue(null);
    prisma.clientPermission.create.mockResolvedValue({
      id: "1",
      name: "Edit Profile",
      path: "/edit-profile",
      message: "Client permission created successfully",
    });

    const req = {
      json: async () => ({
        name: "Edit Profile",
        sort: 10,
        menu: "User Settings",
        path: "/edit-profile",
        description: "Allows editing of user profiles",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(prisma.clientPermission.create).toHaveBeenCalledWith({
      data: {
        name: "Edit Profile",
        description: "Allows editing of user profiles",
        sort: 10,
        menu: "User Settings",
        path: "/edit-profile",
      },
    });
    expect(body.message).toEqual("Client permission created successfully");
  });

  it("should return error if permission path already exists", async () => {
    prisma.clientPermission.findFirst.mockResolvedValue(true); // Simulating permission already exists

    const req = {
      json: async () => ({
        name: "Edit Profile",
        sort: 10,
        menu: "User Settings",
        path: "/edit-profile",
        description: "Allows editing of user profiles",
      }),
    };

    const response = await POST(req);
    expect(response.status).toBe(409);
    expect(response.error).toEqual("Client permission already exists");
  });
});
