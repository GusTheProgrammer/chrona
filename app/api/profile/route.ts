import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Retrieve user profile
 *     description: Fetches the profile details of the authenticated user.
 *     responses:
 *       200:
 *         description: User profile data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the user.
 *                 name:
 *                   type: string
 *                   description: Full name of the user.
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Email address of the user.
 *                 mobile:
 *                   type: string
 *                   description: Mobile phone number of the user.
 *                 image:
 *                   type: string
 *                   description: URL to the user's profile image.
 *                 bio:
 *                   type: string
 *                   description: Brief biography of the user.
 *                 address:
 *                   type: string
 *                   description: Address of the user.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextApiRequestExtended) {
  try {
    await isAuth(req);

    const userObj = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    return NextResponse.json(userObj);
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
