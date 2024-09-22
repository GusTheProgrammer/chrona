/**
 * @jest-environment node
 */
import { GET } from "@/app/api/profile/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("GET /api/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve user profile successfully", async () => {
    const fakeUser = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      mobile: "1234567890",
      image: "http://example.com/image.jpg",
      bio: "A brief bio here",
      address: "1234 Some Street",
    };

    (isAuth as jest.Mock).mockImplementation(async (req: any) => {
      req.user = { id: "1" };
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);

    const req = {
      user: {
        id: "1",
      },
      query: {},
    } as unknown as NextApiRequestExtended;

    const response = await GET(req);
    const body = await response.json();

    expect(isAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        image: true,
        bio: true,
        address: true,
      },
    });
    expect(response.status).toBe(200);
    expect(body).toEqual(fakeUser);
  });

  it("should handle errors when fetching user profile", async () => {
    (isAuth as jest.Mock).mockImplementation(async (req: any) => {
      req.user = { id: "1" };
    });
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Internal server error")
    );

    const req = {
      user: {
        id: "1",
      },
      query: {},
    } as unknown as NextApiRequestExtended;

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toEqual("Internal server error");
  });
});
