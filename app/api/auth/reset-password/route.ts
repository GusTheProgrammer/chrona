import { NextResponse } from "next/server";
import crypto from "crypto";
import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset a user's password
 *     description: Allows a user to reset their password using a reset token that has been verified as valid and not expired.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, resetToken]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The new password for the user.
 *               resetToken:
 *                 type: string
 *                 description: The reset token that was sent to the user's email to authenticate password reset requests.
 *     responses:
 *       200:
 *         description: Password has been successfully reset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password has been reset"
 *       401:
 *         description: Invalid or expired reset token provided.
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: NextApiRequestExtended) {
  try {
    const { password, resetToken } = await req.json();

    if (!resetToken || !password)
      return getErrorResponse("Invalid request", 401);

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user =
      resetPasswordToken &&
      (await prisma.user.findFirst({
        where: {
          resetPasswordToken,
          resetPasswordExpire: { gt: Date.now() },
        },
      }));

    if (!user) return getErrorResponse("Invalid token or expired", 401);

    const u = await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpire: null,
        password: await encryptPassword({ password }),
      },
    });

    return NextResponse.json({ message: "Password has been reset" });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
