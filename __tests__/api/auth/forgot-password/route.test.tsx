/**
 * @jest-environment node
 */
import { POST } from "@/app/api/auth/forgot-password/route";
import { prisma } from "@/lib/prisma.db";
import { sendEmail } from "@/lib/nodemailer";
import DeviceDetector from "device-detector-js";
import { getErrorResponse, getResetPasswordToken } from "@/lib/helpers";
import { eTemplate } from "@/lib/eTemplate";
import { NextResponse } from "next/server";

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/nodemailer", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("device-detector-js");
jest.mock("@/lib/helpers", () => ({
  getErrorResponse: jest.fn().mockImplementation((message, status) => {
    return NextResponse.json({ error: message }, { status });
  }),
  getResetPasswordToken: jest.fn(),
}));

jest.mock("@/lib/eTemplate", () => ({
  eTemplate: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
  },
}));

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DeviceDetector.mockImplementation(() => ({
      parse: jest.fn().mockReturnValue({
        client: { type: "browser", name: "Chrome" },
        os: { name: "Windows" },
        device: { type: "desktop", brand: "HP" },
      }),
    }));
    getResetPasswordToken.mockResolvedValue({
      resetPasswordToken: "token123",
      resetPasswordExpire: new Date(Date.now() + 3600000), // 1 hour ahead
    });
    eTemplate.mockReturnValue("Generated email template");
  });

  it("should return a 404 error if no user found with the provided email", async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    const req = {
      json: async () => ({ email: "nonexistent@example.com" }),
      headers: new Map([
        ["host", "localhost:3000"],
        ["x-forwarded-proto", "http"],
        ["user-agent", "Mozilla/5.0..."],
      ]),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toEqual(
      "There is no user with email nonexistent@example.com"
    );
  });

  it("should send a reset email if the user exists", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: "user1",
      email: "user@example.com",
    });
    sendEmail.mockResolvedValue(true);

    const req = {
      json: async () => ({ email: "user@example.com" }),
      headers: new Map([
        ["host", "localhost:3000"],
        ["x-forwarded-proto", "http"],
        ["user-agent", "Mozilla/5.0..."],
      ]),
    };

    const response = await POST(req);
    const body = await response.json();

    expect(sendEmail).toHaveBeenCalledWith({
      to: "user@example.com",
      subject: "Password Reset Request",
      text: "Generated email template",
      webName: "Next.JS Boilerplate Team",
    });
    expect(response.status).toBe(200);
    expect(body.message).toEqual(
      "An email has been sent to user@example.com with further instructions."
    );
  });
});
