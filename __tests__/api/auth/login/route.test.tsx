/**
 * @jest-environment node
 */
import { POST } from "@/app/api/auth/login/route";
import { prisma } from "@/lib/prisma.db";
import { matchPassword, generateToken, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";

// Mocks
jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    role: {
      findFirst: jest.fn(() => Promise.resolve([])), // Ensure it returns an empty array
    },
  },
}));

jest.mock("@/lib/helpers", () => ({
  matchPassword: jest.fn(),
  generateToken: jest.fn(),
  getErrorResponse: jest.fn().mockImplementation((message, status) => {
    return NextResponse.json({ error: message }, { status });
  }),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: () => Promise.resolve(data),
      status: options.status,
    })),
  },
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log in successfully and return user data and permissions", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: "user1",
      email: "jane@example.com",
      password: "hashedPassword",
      confirmed: true,
      blocked: false,
      roleId: "role1",
    });
    matchPassword.mockResolvedValueOnce(true);
    prisma.role.findFirst.mockResolvedValueOnce({
      id: "role1",
      type: "User",
      clientPermissions: [
        { menu: "dashboard", path: "/dashboard", name: "Dashboard", sort: 1 },
      ],
    });
    generateToken.mockResolvedValueOnce("token123");

    const req = {
      json: async () => ({
        email: "jane@example.com",
        password: "correctPassword",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: "user1",
      email: "jane@example.com",
      token: "token123",
      message: "User has been logged in successfully",
      blocked: false,
      confirmed: true,
      role: "User",
      routes: [
        {
          menu: "dashboard",
          path: "/dashboard",
          name: "Dashboard",
          sort: 1,
        },
      ],
      menu: [
        {
          name: "dashboard",
          sort: 1,
          open: false,
          children: [
            {
              name: "Dashboard",
              path: "/dashboard",
            },
          ],
        },
      ],
    });
  });

  it("should return an error for invalid email or password", async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const req = {
      json: async () => ({
        email: "nonexistent@example.com",
        password: "wrongpassword123",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toEqual("Invalid email or password");
  });

  it("should return an error if password does not match", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      email: "jane@example.com",
      password: "hashedPassword",
    });
    matchPassword.mockResolvedValueOnce(false);

    const req = {
      json: async () => ({
        email: "jane@example.com",
        password: "incorrectPassword",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toEqual("Invalid email or password");
  });

  it("should handle blocked user", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      email: "jane@example.com",
      password: "hashedPassword",
      blocked: true,
    });
    matchPassword.mockResolvedValueOnce(true);

    const req = {
      json: async () => ({
        email: "jane@example.com",
        password: "correctPassword",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toEqual("User is blocked");
  });

  it("should handle unconfirmed user", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      email: "jane@example.com",
      password: "hashedPassword",
      confirmed: false,
    });
    matchPassword.mockResolvedValueOnce(true);

    const req = {
      json: async () => ({
        email: "jane@example.com",
        password: "correctPassword",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toEqual("User is not confirmed");
  });

  it("should handle missing role", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      email: "jane@example.com",
      password: "hashedPassword",
      confirmed: true,
    });
    matchPassword.mockResolvedValueOnce(true);
    prisma.role.findFirst.mockResolvedValueOnce(null);

    const req = {
      json: async () => ({
        email: "jane@example.com",
        password: "correctPassword",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toEqual("Role not found");
  });
});
