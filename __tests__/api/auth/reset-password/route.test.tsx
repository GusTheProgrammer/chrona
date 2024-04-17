/**
 * @jest-environment node
 */
import { POST } from "@/app/api/auth/reset-password/route";
import { prisma } from "@/lib/prisma.db";
import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Mocks
jest.mock("crypto", () => ({
  createHash: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  digest: jest.fn(),
}));

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/helpers", () => ({
  encryptPassword: jest.fn(),
  getErrorResponse: jest.fn().mockImplementation((message, status) => {
    return NextResponse.json({ error: message }, { status });
  }),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
  },
}));

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    crypto.createHash().update().digest.mockReturnValue("hashedToken");
  });

  it("should successfully reset the password with a valid token", async () => {
    prisma.user.findFirst.mockResolvedValueOnce({
      id: "user1",
      resetPasswordToken: "hashedToken",
      resetPasswordExpire: Date.now() + 3600000, // 1 hour in the future
    });
    prisma.user.update.mockResolvedValueOnce({});
    encryptPassword.mockResolvedValue("encryptedPassword");

    const req = {
      json: async () => ({
        password: "newPassword123",
        resetToken: "validToken123",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toEqual("Password has been reset");
  });

  it("should return an error for invalid or expired token", async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);

    const req = {
      json: async () => ({
        password: "newPassword123",
        resetToken: "expiredToken123",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toEqual("Invalid token or expired");
  });

  it("should handle internal server errors", async () => {
    prisma.user.findFirst.mockRejectedValue(new Error("Internal Server Error"));

    const req = {
      json: async () => ({
        password: "newPassword123",
        resetToken: "validToken123",
      }),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toEqual("Internal Server Error");
  });
});
