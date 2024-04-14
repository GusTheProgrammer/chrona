import { PUT, DELETE } from "@/app/api/permissions/[id]/route";
import { isAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma.db";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

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

jest.mock("@/lib/helpers", () => ({
  getErrorResponse: jest.fn().mockImplementation((message, status) => {
    return { error: message, status };
  }),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data) => ({
      json: () => Promise.resolve(data),
      status: (code) => {
        return { json: () => Promise.resolve(data), statusCode: code };
      },
    })),
  },
}));

describe("PUT /api/permissions/{id}", () => {
  it("should update the permission successfully", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.findUnique.mockResolvedValue({
      id: "1",
      name: "Original Permission",
      method: "GET",
      route: "/original",
    });
    prisma.permission.findFirst.mockResolvedValue(null);
    prisma.permission.update.mockResolvedValue({
      id: "1",
      name: "Updated Permission",
      method: "GET",
      route: "/updated",
      description: "Updated Description",
    });

    const req = {
      json: async () => ({
        name: "Updated Permission",
        method: "GET",
        route: "/updated",
        description: "Updated Description",
      }),
      params: { id: "1" },
    };

    const response = await PUT(req, { params: { id: "1" } });
    expect(prisma.permission.update).toHaveBeenCalled();
    expect(response.json().message).toBe(
      "Permission has been updated successfully"
    );
  });

  it("should return an error if the permission does not exist", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.findUnique.mockResolvedValue(null);

    const req = { params: { id: "nonexistent" } };

    await PUT(req, { params: { id: "nonexistent" } });
    expect(getErrorResponse).toHaveBeenCalledWith("Permission not found", 404);
  });
});

describe("DELETE /api/permissions/{id}", () => {
  it("should delete the permission successfully", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.delete.mockResolvedValue({
      id: "1",
      message: "Permission has been removed successfully",
    });

    const req = { params: { id: "1" } };

    const response = await DELETE(req, { params: { id: "1" } });
    expect(prisma.permission.delete).toHaveBeenCalled();
    expect(response.json().message).toBe(
      "Permission has been removed successfully"
    );
  });

  it("should return an error if the permission to delete is not found", async () => {
    isAuth.mockResolvedValue(true);
    prisma.permission.delete.mockRejectedValue(
      new Error("Permission not removed")
    );

    const req = { params: { id: "nonexistent" } };

    await DELETE(req, { params: { id: "nonexistent" } });
    expect(getErrorResponse).toHaveBeenCalledWith(
      "Permission not removed",
      404
    );
  });
});
