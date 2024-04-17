/**
 * @jest-environment node
 */
import { PUT, DELETE } from "@/app/api/client-permissions/[id]/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    clientPermission: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/helpers", () => ({
  getErrorResponse: jest.fn().mockImplementation((message, status) => ({
    json: () => Promise.resolve({ error: message, status }),
  })),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
  },
}));

describe("PUT /api/client-permissions/{id}", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a client permission successfully", async () => {
    const req = {
      json: async () => ({
        name: "New Permission",
        sort: 1,
        menu: "Main",
        path: "/new-permission",
        description: "New permission description",
      }),
      params: { id: "1" },
    };
    isAuth.mockResolvedValue(true);
    prisma.clientPermission.findUnique.mockResolvedValue({
      id: "1",
    });
    prisma.clientPermission.findFirst.mockResolvedValue(null);
    prisma.clientPermission.update.mockResolvedValue({
      id: "1",
      name: "New Permission",
      path: "/new-permission",
    });

    const response = await PUT(req, { params: { id: "1" } });
    const body = await response.json();

    expect(prisma.clientPermission.update).toHaveBeenCalled();
    expect(body.message).toEqual(
      "Client permission has been updated successfully"
    );
  });

  it("should return an error if permission not found", async () => {
    const req = {
      json: async () => ({ name: "New Permission" }),
      params: { id: "1" },
    };
    isAuth.mockResolvedValue(true);
    prisma.clientPermission.findUnique.mockResolvedValue(null);

    const response = await PUT(req, { params: { id: "1" } });
    const body = await response.json();

    expect(body.status).toBe(404);
    expect(body.error).toEqual("Client permission not found");
  });
});

describe("DELETE /api/client-permissions/{id}", () => {
  it("should delete a client permission successfully", async () => {
    const req = { params: { id: "1" } };
    isAuth.mockResolvedValue(true);
    prisma.clientPermission.delete.mockResolvedValue({
      id: "1",
      message: "Client permission has been removed successfully",
    });

    const response = await DELETE(req, { params: { id: "1" } });
    const body = await response.json();

    expect(prisma.clientPermission.delete).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(body.message).toEqual(
      "Client permission has been removed successfully"
    );
  });

  it("should return an error if client permission not found", async () => {
    const req = { params: { id: "1" } };
    isAuth.mockResolvedValue(true);
    prisma.clientPermission.delete.mockImplementation(() => {
      throw new Error("Client permission not found");
    });

    const response = await DELETE(req, { params: { id: "1" } });
    const body = await response.json();

    expect(body.status).toBe(500);
    expect(body.error).toEqual("Client permission not found");
  });
});
