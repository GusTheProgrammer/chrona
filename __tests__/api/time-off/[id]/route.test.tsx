/**
 * @jest-environment node
 */
import { POST, PUT, DELETE } from "@/app/api/time-off/[id]/route";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

jest.mock("@/lib/prisma.db", () => ({
  prisma: {
    timeOff: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    shiftType: {
      findMany: jest.fn(),
    },
    scheduler: {
      findMany: jest.fn(),
    },
    shift: {
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  isAuth: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options.status,
    })),
  },
}));

describe("POST /api/time-off/{id}", () => {
  it("should successfully approve a time-off request and update shift details", async () => {
    // Setup mocks and request object
    isAuth.mockResolvedValueOnce(true);
    const req = {
      headers: new Map([["X-User-Id", "manager1"]]),
      json: async () => ({ isApproved: true }),
    };

    prisma.user.findUnique.mockResolvedValueOnce({
      id: "manager1",
      role: { name: "Manager" },
    });

    prisma.timeOff.findUnique.mockResolvedValueOnce({
      id: "timeOff1",
      userId: "user1",
      reason: "Vacation",
      startDate: new Date("2024-12-20"),
      endDate: new Date("2024-12-25"),
    });

    prisma.shiftType.findMany.mockResolvedValueOnce([
      { name: "Vacation", color: "Blue" },
    ]);
    prisma.scheduler.findMany.mockResolvedValueOnce([
      { shiftId: "shift1", userId: "user1" },
    ]);
    prisma.shift.update.mockResolvedValueOnce({
      name: "Vacation",
      color: "Blue",
    });
    prisma.timeOff.update.mockResolvedValueOnce({
      id: "timeOff1",
      status: "approved",
    });

    // Call the POST function and await its response
    const response = await POST(req, { params: { id: "timeOff1" } });
    const responseBody = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(responseBody).toEqual(
      expect.objectContaining({
        message: "TimeOff request approved successfully",
      })
    );
    expect(prisma.shift.update).toHaveBeenCalled();
    expect(prisma.timeOff.update).toHaveBeenCalledWith({
      where: { id: "timeOff1" },
      data: { status: "approved" },
    });
  });

  it("should return 404 if the time-off request is not found", async () => {
    // Setup mocks and request object
    isAuth.mockResolvedValueOnce(true);
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
      json: async () => ({ isApproved: true }),
    };

    prisma.user.findUnique.mockResolvedValueOnce({
      id: "user1",
      role: { name: "Manager" },
    });

    prisma.timeOff.findUnique.mockResolvedValueOnce(null);

    // Call the POST function and await its response
    const response = await POST(req, { params: { id: "nonExistentId" } });
    const responseBody = await response.json();

    // Assertions
    expect(response.status).toBe(404);
    expect(responseBody).toEqual(
      expect.objectContaining({
        error: "TimeOff request not found",
      })
    );
  });

  it("should return 403 if user is not authorized", async () => {
    // Setup mocks and request object
    isAuth.mockResolvedValueOnce(true);
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
      json: async () => ({ isApproved: true }),
    };

    prisma.user.findUnique.mockResolvedValueOnce({
      id: "user1",
      role: { name: "Employee" },
    });

    // Call the POST function and await its response
    const response = await POST(req, { params: { id: "timeOff1" } });
    const responseBody = await response.json();

    // Assertions
    expect(response.status).toBe(403);
    expect(responseBody).toEqual(
      expect.objectContaining({
        error: expect.stringContaining(
          "You are not authorized to approve time off requests"
        ),
      })
    );
  });
});

describe("PUT /api/time-off/{id}", () => {
  it("should successfully update a time-off request", async () => {
    isAuth.mockResolvedValue(true);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10); // Set to 10 days in the future
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
      json: async () => ({
        startDate: futureDate.toISOString().split("T")[0],
        endDate: futureDate.toISOString().split("T")[0],
        shiftType: "Holiday",
      }),
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce({
      userId: "user1",
      status: "pending",
    });
    prisma.timeOff.update.mockResolvedValueOnce({
      status: "updated",
    });

    const response = await PUT(req, { params: { id: "timeOff1" } });
    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual(
      expect.objectContaining({
        message: "TimeOff request updated successfully",
      })
    );
  });

  it("should return 400 if editing approved time-off request", async () => {
    isAuth.mockResolvedValueOnce(true);
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
      json: async () => ({
        startDate: "2024-01-01",
        endDate: "2024-01-10",
        shiftType: "Vacation",
      }),
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce({
      userId: "user1",
      status: "approved",
    });

    const response = await PUT(req, { params: { id: "timeOff1" } });
    expect(response.status).toBe(400);
    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual(
      expect.objectContaining({
        error: "Approved time-off requests cannot be edited",
      })
    );
  });

  it("should return 403 if the user is not the one tied to the time-off request", async () => {
    isAuth.mockResolvedValue(true);
    const req = {
      headers: new Map([["X-User-Id", "user2"]]), // Different user ID
      json: async () => ({
        startDate: "2024-12-20",
        endDate: "2024-12-25",
        shiftType: "Holiday",
      }),
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce({
      userId: "user1", // Original user ID
      status: "pending",
    });

    const response = await PUT(req, { params: { id: "timeOff1" } });
    const jsonResponse = await response.json();
    expect(response.status).toBe(403);
    expect(jsonResponse).toEqual(
      expect.objectContaining({
        error: "Unauthorized to edit this time-off request",
      })
    );
  });

  it("should return 404 if the time-off request is not found", async () => {
    isAuth.mockResolvedValue(true); // Assume user is authenticated
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce(null); // No time-off request found

    const response = await PUT(req, { params: { id: "nonexistentId" } });
    const jsonResponse = await response.json();
    expect(response.status).toBe(404);
    expect(jsonResponse).toEqual(
      expect.objectContaining({
        error: "TimeOff request not found",
      })
    );
  });

  it("should return 400 if the start date is in the past", async () => {
    isAuth.mockResolvedValue(true);
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Set to yesterday
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
      json: async () => ({
        startDate: pastDate.toISOString().split("T")[0],
        endDate: "2024-12-30",
        shiftType: "Holiday",
      }),
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce({
      userId: "user1",
      status: "pending",
    });

    const response = await PUT(req, { params: { id: "timeOff1" } });
    const jsonResponse = await response.json();
    expect(response.status).toBe(400);
    expect(jsonResponse).toEqual(
      expect.objectContaining({
        error: "Time-off requests must be for future dates.",
      })
    );
  });

  it("should create a new request with pending status when editing a declined time-off request", async () => {
    isAuth.mockResolvedValue(true);
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
      json: async () => ({
        startDate: "2024-12-20",
        endDate: "2024-12-25",
        shiftType: "Holiday",
      }),
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce({
      userId: "user1",
      status: "declined",
    });
    prisma.timeOff.create.mockResolvedValueOnce({
      status: "pending",
    });

    const response = await PUT(req, { params: { id: "timeOff1" } });
    const jsonResponse = await response.json();

    expect(response.status).toBe(201);
    expect(jsonResponse).toEqual(
      expect.objectContaining({
        message: "New time-off request created with pending status",
      })
    );
  });
});

describe("DELETE /api/time-off/{id}", () => {
  it("should successfully delete a pending time-off request", async () => {
    isAuth.mockResolvedValue(true);
    const req = {
      headers: new Map([["X-User-Id", "user1"]]), // User ID matches the one on the request
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce({
      userId: "user1", // Same user
      status: "pending",
    });
    prisma.timeOff.delete.mockResolvedValueOnce({}); // Simulate successful deletion

    const response = await DELETE(req, { params: { id: "timeOff1" } });
    const jsonResponse = await response.json(); // Await the JSON response
    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual({
      message: "TimeOff request deleted successfully",
    });
  });

  it("should return 400 if request is not pending", async () => {
    isAuth.mockResolvedValueOnce(true);
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce({
      userId: "user1",
      status: "approved",
    });

    const response = await DELETE(req, { params: { id: "timeOff1" } });
    expect(response.status).toBe(400);
    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual(
      expect.objectContaining({
        error: "Only pending time-off requests can be deleted",
      })
    );
  });

  it("should return 403 if the time-off request is not created by the user attempting to delete it", async () => {
    isAuth.mockResolvedValue(true);
    const req = {
      headers: new Map([["X-User-Id", "user2"]]), // User ID does not match the one on the request
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce({
      userId: "user1", // Different user
      status: "pending",
    });

    const response = await DELETE(req, { params: { id: "timeOff1" } });
    const jsonResponse = await response.json(); // Await the JSON response
    expect(response.status).toBe(403);
    expect(jsonResponse).toEqual({
      error: "Unauthorized to delete this time-off request",
    });
  });

  it("should return 404 if the time-off request is not found", async () => {
    isAuth.mockResolvedValue(true); // Assume user is authenticated
    const req = {
      headers: new Map([["X-User-Id", "user1"]]),
    };
    prisma.timeOff.findUnique.mockResolvedValueOnce(null); // No time-off request found

    const response = await DELETE(req, { params: { id: "nonexistentId" } });
    const jsonResponse = await response.json(); // Await the JSON response
    expect(response.status).toBe(404);
    expect(jsonResponse).toEqual({
      error: "TimeOff request not found",
    });
  });
});
