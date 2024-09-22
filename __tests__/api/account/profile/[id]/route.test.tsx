/**
 * @jest-environment node
 */
import { PUT } from "@/app/api/profile/[id]/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse, NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
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

describe("PUT /api/profile/{id}", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update user profile successfully", async () => {
    const fakeUser = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      mobile: "1234567890",
      image: "http://example.com/image.jpg",
      bio: "A brief bio here",
      address: "1234 Some Street",
    };

    const updatedData = {
      name: "Jane Doe",
      address: "5678 Another Street",
      mobile: "0987654321",
      bio: "Updated bio",
      image: "http://example.com/new-image.jpg",
    };

    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...fakeUser,
      ...updatedData,
    });

    const req = new Request("http://localhost/api/profile/1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updatedData,
        password: "NewValidPassword1!",
      }),
    });

    (encryptPassword as jest.Mock).mockResolvedValue("encryptedPassword");

    const response = await PUT(req, { params: { id: "1" } });
    const body = await response.json();

    expect(isAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        name: updatedData.name,
        mobile: updatedData.mobile,
        address: updatedData.address,
        image: updatedData.image,
        bio: updatedData.bio,
        password: "encryptedPassword",
      },
    });
    expect(response.status).toBe(200);
    expect(body.message).toEqual("Profile has been updated successfully");
  });

  it("should return an error if the user does not exist", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/profile/1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Jane Doe" }),
    });

    const response = await PUT(req, { params: { id: "1" } });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toEqual("User profile not found");
  });

  it("should handle password validation error", async () => {
    (isAuth as jest.Mock).mockResolvedValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });

    const req = new Request("http://localhost/api/profile/1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: "short" }),
    });

    const response = await PUT(req, { params: { id: "1" } });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toEqual(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number and one special character"
    );
  });
});
