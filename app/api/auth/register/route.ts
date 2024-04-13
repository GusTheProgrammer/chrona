import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db"; // Make sure you import prisma

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a new user account with the specified details. Verifies that passwords match and checks if the user already exists based on the email provided.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword, isManager, teamId]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user, used for login and communication.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the user account.
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the password, must match the password field.
 *               isManager:
 *                 type: boolean
 *                 description: Flag to indicate if the user is a manager.
 *               teamId:
 *                 type: string
 *                 description: ID of the team to which the user will be assigned, optional based on your implementation.
 *     responses:
 *       200:
 *         description: User registered successfully. Returns the created user's details except for the password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleId:
 *                       type: string
 *                     teamId:
 *                       type: string
 *                     image:
 *                       type: string
 *                     confirmed:
 *                       type: boolean
 *                     blocked:
 *                       type: boolean
 *                 message:
 *                   type: string
 *                   example: "User has been created successfully"
 *       400:
 *         description: Validation error, such as password mismatch or missing required fields.
 *       409:
 *         description: User already exists with the given email.
 *       404:
 *         description: Specified role not found.
 *       500:
 *         description: Internal server error during user creation.
 */
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
