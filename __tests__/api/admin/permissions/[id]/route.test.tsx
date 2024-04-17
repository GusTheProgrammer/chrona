/**
 * @jest-environment node
 */
import { PUT, DELETE } from "@/app/api/permissions/[id]/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    permission: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
  },
}));

describe("PUT /api/permissions/{id}", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a permission successfully", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.findUnique.mockResolvedValue({
      id: "1",
      name: "Test Permission",
    });
    prisma.permission.findFirst.mockResolvedValue(null);
    prisma.permission.update.mockResolvedValue({
      id: "1",
      name: "Updated Test Permission",
    });

    const req = {
      json: async () => ({
        name: "Updated Test Permission",
        method: "GET",
        route: "/api/test",
        description: "Updated description",
      }),
      params: { id: "1" },
    };

    const response = await PUT(req, { params: { id: "1" } });
    const body = await response.json();

    expect(isAuth).toHaveBeenCalled();
    expect(prisma.permission.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        name: "Updated Test Permission",
        method: "GET",
        description: "Updated description",
        route: "/api/test",
      },
    });
    expect(body.message).toEqual("Permission has been updated successfully");
  });

  it("should return 404 if the permission is not found", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.findUnique.mockResolvedValue(null);

    const req = {
      json: async () => ({
        name: "Nonexistent Permission",
      }),
      params: { id: "nonexistent" },
    };

    const response = await PUT(req, { params: { id: "nonexistent" } });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toEqual("Permission not found");
  });

  it("should return 409 if there is a permission path conflict", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.findUnique.mockResolvedValue({
      id: "1",
      name: "Existing Permission",
    });
    prisma.permission.findFirst.mockResolvedValue({
      id: "2",
      name: "Another Permission",
    });

    const req = {
      json: async () => ({
        name: "Updated Permission",
        method: "GET",
        route: "/api/existing",
        description: "A conflicting permission",
      }),
      params: { id: "1" },
    };

    const response = await PUT(req, { params: { id: "1" } });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toEqual("Permission already exist");
  });
});

describe("DELETE /api/permissions/{id}", () => {
  it("should delete a permission successfully", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.delete.mockResolvedValue({
      id: "1",
      name: "Deleted Permission",
    });

    const req = {
      params: { id: "1" },
    };

    const response = await DELETE(req, { params: { id: "1" } });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.message).toEqual("Permission has been removed successfully");
  });

  it("should return 404 if the permission to delete is not found", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.delete.mockRejectedValue(
      new Error("Permission not found")
    );

    const req = {
      params: { id: "nonexistent" },
    };

    const response = await DELETE(req, { params: { id: "nonexistent" } });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toEqual("Permission not found");
  });
});
