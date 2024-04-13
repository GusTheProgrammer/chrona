import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db"; // Make sure you import prisma

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword, isManager, teamId } =
      await req.json();
    // Basic validation
    if (password !== confirmPassword) {
      return getErrorResponse("Passwords do not match", 400);
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) return getErrorResponse("User already exists", 409);

    // Fetch the roleId by roleName
    const role = await prisma.role.findFirst({
      where: {
        name: isManager ? "Manager" : "Employee",
      },
    });
    if (!role) return getErrorResponse("Role not found", 404);

    // Create the new user with the roleId and teamId
    const userObj = await prisma.user.create({
      data: {
        name: name,
        email: email.toLowerCase(),
        password: await encryptPassword({ password }),
        roleId: role.id,
        teamId: teamId, // Assuming teamId is optional, adjust if necessary
        image: `https://ui-avatars.com/api/?uppercase=true&name=${name}&background=random&color=random&size=128`,
        confirmed: !isManager, // Set confirmed to false if isManager is true, otherwise true
        blocked: false,
      },
    });

    // Ensure password is not returned in the response
    const { password: _, ...responseUser } = userObj;

    return NextResponse.json({
      user: responseUser,
      message: "User has been created successfully",
    });
  } catch (error: string | any) {
    console.error("Error creating user:", error.message);
    // Use a general error response for unexpected errors
    return getErrorResponse("An error occurred while creating the user", 500);
  }
}
