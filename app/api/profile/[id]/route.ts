import { isAuth } from "@/lib/auth";
import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/profile/{id}:
 *   put:
 *     tags:
 *       - Profile
 *     summary: Update user profile
 *     description: Updates the profile details of a specific user identified by their unique ID. Allows optional update of the user's password with validation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the user whose profile is being updated.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *               address:
 *                 type: string
 *                 description: Address of the user.
 *               mobile:
 *                 type: string
 *                 description: Mobile phone number of the user.
 *               bio:
 *                 type: string
 *                 description: Brief biography of the user.
 *               image:
 *                 type: string
 *                 description: URL to the user's profile image.
 *               password:
 *                 type: string
 *                 description: New password for the user, must meet specific criteria for security.
 *     responses:
 *       200:
 *         description: User profile updated successfully. Returns updated profile details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 image:
 *                   type: string
 *                 mobile:
 *                   type: string
 *                 message:
 *                   type: string
 *                   example: "Profile has been updated successfully"
 *       400:
 *         description: Password validation error or other input validation issues.
 *       404:
 *         description: User profile not found.
 *       500:
 *         description: Internal server error.
 */

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const { name, address, mobile, bio, image, password } = await req.json();

    const object = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!object) return getErrorResponse("User profile not found", 404);

    if (password) {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!regex.test(password))
        return getErrorResponse(
          "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number and one special character",
          400
        );
    }

    const result = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(password && { password: await encryptPassword({ password }) }),
        name: name || object.name,
        mobile: mobile || object.mobile,
        address: address || object.address,
        image: image || object.image,
        bio: bio || object.bio,
      },
    });

    return NextResponse.json({
      name: result.name,
      email: result.email,
      image: result.image,
      mobile: result.mobile,
      message: "Profile has been updated successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
