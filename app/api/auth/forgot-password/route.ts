import { sendEmail } from "@/lib/nodemailer";
import DeviceDetector from "device-detector-js";
import { eTemplate } from "@/lib/eTemplate";
import { NextResponse } from "next/server";
import { getErrorResponse, getResetPasswordToken } from "@/lib/helpers";
import { prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request a password reset link
 *     description: This endpoint handles password reset requests. It sends an email with a password reset link to the user's registered email address if the user exists in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address associated with the user account for which the password reset is requested.
 *     responses:
 *       200:
 *         description: Email sent successfully with password reset instructions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An email has been sent to user@example.com with further instructions."
 *       400:
 *         description: Invalid input, such as missing or empty email field.
 *       404:
 *         description: No user found with the provided email address.
 *       500:
 *         description: Internal server error.
 */

export async function POST(req: NextApiRequestExtended) {
  try {
    const { email } = await req.json();
    if (!email) return getErrorResponse("Please enter your email", 400);

    const host = req.headers.get("host"); // localhost:3000
    const protocol = req.headers.get("x-forwarded-proto"); // http

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user)
      return getErrorResponse(`There is no user with email ${email}`, 404);

    const reset = await getResetPasswordToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: reset.resetPasswordToken,
        resetPasswordExpire: reset.resetPasswordExpire,
      },
    });

    const deviceDetector = new DeviceDetector();
    const device = deviceDetector.parse(
      req.headers.get("user-agent") || ""
    ) as any;

    const {
      client: { type: clientType, name: clientName },
      os: { name: osName },
      device: { type: deviceType, brand },
    } = device;

    const message = eTemplate({
      url: `${protocol}://${host}/auth/reset-password/${reset.resetToken}`,
      user: user.name,
      clientType,
      clientName,
      osName,
      deviceType,
      brand,
      webName: "Chrona ©",
      validTime: "10 minutes",
      addressStreet: "Dublin",
      addressCountry: "Irelnad",
    });

    const result = await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
      webName: "Next.JS Boilerplate Team",
    });

    if (result)
      return NextResponse.json({
        message: `An email has been sent to ${email} with further instructions.`,
      });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
