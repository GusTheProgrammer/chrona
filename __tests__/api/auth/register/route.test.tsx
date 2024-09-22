/**
 * @jest-environment node
 */
import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma.db";
import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse, NextRequest } from "next/server";

// Mocks
jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("@/lib/helpers", () => ({
  encryptPassword: jest.fn(),
  getErrorResponse: jest.fn((message, status) => {
    return NextResponse.json({ error: message }, { status });
  }),
}));

describe("POST /api/auth/register", () => {
  it("should return an error when passwords do not match", async () => {
    const req = {
      json: async () => ({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password456",
        isManager: false,
        teamId: "team1",
      }),
    } as unknown as NextRequest;

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toEqual("Passwords do not match");
  });

  it("should return an error if the user already exists", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({ email: "john@example.com" });

    const req = {
      json: async () => ({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        isManager: false,
        teamId: "team1",
      }),
    } as unknown as NextRequest;

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toEqual("User already exists");
  });

  it("should successfully create a user", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.role.findFirst as jest.Mock).mockResolvedValueOnce({ id: "role1" });
    (encryptPassword as jest.Mock).mockResolvedValue("encryptedPassword");

    const req = {
      json: async () => ({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        confirmPassword: "password123",
        isManager: true,
        teamId: "team1",
      }),
    } as unknown as NextRequest;

    (prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: "user1",
      name: "Jane Doe",
      email: "jane@example.com",
      roleId: "role1",
      teamId: "team1",
      image: "https://example.com/image.jpg",
      confirmed: false,
      blocked: false,
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user).toEqual({
      id: "user1",
      name: "Jane Doe",
      email: "jane@example.com",
      roleId: "role1",
      teamId: "team1",
      image: "https://example.com/image.jpg",
      confirmed: false,
      blocked: false,
    });
    expect(body.message).toEqual("User has been created successfully");
  });
});
