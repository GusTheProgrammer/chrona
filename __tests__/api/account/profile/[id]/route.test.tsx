/**
 * @jest-environment node
 */
import { PUT } from "@/app/api/profile/[id]/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";

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
    return { error: message, status };
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

    isAuth.mockResolvedValue(true);
    prisma.user.findUnique.mockResolvedValue(fakeUser);
    prisma.user.update.mockResolvedValue({
      ...fakeUser,
      ...updatedData,
    });

    const req = {
      json: async () => ({
        ...updatedData,
        password: "NewValidPassword1!",
      }),
      params: { id: "1" },
    };

    encryptPassword.mockResolvedValue("encryptedPassword");

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
    isAuth.mockResolvedValue(true);
    prisma.user.findUnique.mockResolvedValue(null);

    const req = {
      json: async () => ({ name: "Jane Doe" }),
      params: { id: "1" },
    };

    const response = await PUT(req, { params: { id: "1" } });

    expect(response.status).toBe(404);
    expect(response.error).toEqual("User profile not found");
  });

  it("should handle password validation error", async () => {
    isAuth.mockResolvedValue(true);
    prisma.user.findUnique.mockResolvedValue({ id: "1" });

    const req = {
      json: async () => ({
        password: "short",
      }),
      params: { id: "1" },
    };

    const response = await PUT(req, { params: { id: "1" } });

    expect(response.status).toBe(400);
    expect(response.error).toEqual(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number and one special character"
    );
  });
});
