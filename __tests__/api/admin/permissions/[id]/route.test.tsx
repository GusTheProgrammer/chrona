/**
 * @jest-environment node
 */
import { PUT, DELETE } from "@/app/api/permissions/[id]/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

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

describe("PUT /api/permissions/{id}", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a permission successfully", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.permission.findUnique as jest.Mock).mockResolvedValue({
      id: "1",
      name: "Test Permission",
    });
    (prisma.permission.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.permission.update as jest.Mock).mockResolvedValue({
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
    } as unknown as NextRequest;

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
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.permission.findUnique as jest.Mock).mockResolvedValue(null);

    const req = {
      json: async () => ({
        name: "Nonexistent Permission",
      }),
    } as unknown as NextRequest;

    const response = await PUT(req, { params: { id: "nonexistent" } });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toEqual("Permission not found");
  });

  it("should return 409 if there is a permission path conflict", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.permission.findUnique as jest.Mock).mockResolvedValue({
      id: "1",
      name: "Existing Permission",
    });
    (prisma.permission.findFirst as jest.Mock).mockResolvedValue({
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
    } as unknown as NextRequest;

    const response = await PUT(req, { params: { id: "1" } });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toEqual("Permission already exist");
  });
});

describe("DELETE /api/permissions/{id}", () => {
  it("should delete a permission successfully", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.permission.delete as jest.Mock).mockResolvedValue({
      id: "1",
      name: "Deleted Permission",
    });

    const req = {} as unknown as NextRequest;

    const response = await DELETE(req, { params: { id: "1" } });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.message).toEqual("Permission has been removed successfully");
  });

  it("should return 404 if the permission to delete is not found", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.permission.delete as jest.Mock).mockRejectedValue(
      new Error("Permission not found")
    );

    const req = {} as unknown as NextRequest;

    const response = await DELETE(req, { params: { id: "nonexistent" } });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toEqual("Permission not found");
  });
});
