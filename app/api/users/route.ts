import { isAuth } from "@/lib/auth";
import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { QueryMode, prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *      - Users
 *     summary: Retrieve a list of users
 *     description: Fetches a paginated list of users based on optional search criteria. Includes detailed information about each user along with their role.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         description: Search query to filter users by email.
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination.
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of users per page.
 *         schema:
 *           type: integer
 *           default: 25
 *     responses:
 *       200:
 *         description: A list of users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 startIndex:
 *                   type: integer
 *                 endIndex:
 *                   type: integer
 *                 count:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       confirmed:
 *                         type: boolean
 *                       blocked:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           name:
 *                             type: string
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: Request) {
  try {
    await isAuth(req);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    const query = q
      ? { email: { contains: q, mode: QueryMode.insensitive } }
      : {};

    const page = parseInt(searchParams.get("page") as string) || 1;
    const pageSize = parseInt(searchParams.get("limit") as string) || 25;
    const skip = (page - 1) * pageSize;

    const [result, total] = await Promise.all([
      prisma.user.findMany({
        where: query,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          confirmed: true,
          blocked: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              type: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.count({ where: query }),
    ]);

    const pages = Math.ceil(total / pageSize);

    return NextResponse.json({
      startIndex: skip + 1,
      endIndex: skip + result.length,
      count: result.length,
      page,
      pages,
      total,
      data: result,
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     description: Creates a new user with the given details, including assigning a role based on the provided role ID. Validates that the email is unique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmed, blocked, roleId]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               confirmed:
 *                 type: boolean
 *               blocked:
 *                 type: boolean
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully. Returns the new user object without the password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userObj:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     confirmed:
 *                       type: boolean
 *                     blocked:
 *                       type: boolean
 *                     image:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "User has been created successfully"
 *       404:
 *         description: Role not found.
 *       409:
 *         description: User already exists.
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: Request) {
  try {
    await isAuth(req);

    const { name, email, password, confirmed, blocked, roleId } =
      await req.json();

    const role =
      roleId && (await prisma.role.findFirst({ where: { id: roleId } }));
    if (!role) return getErrorResponse("Role not found", 404);

    const user =
      email &&
      (await prisma.user.findFirst({
        where: { email: email.toLowerCase() },
      }));
    if (user) return getErrorResponse("User already exists", 409);

    const userObj = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        confirmed,
        blocked,
        role: { connect: { id: role.id } },
        image: `https://ui-avatars.com/api/?uppercase=true&name=${name}&background=random&color=random&size=128`,
        password: await encryptPassword({ password }),
        Team: {
          /* provide the necessary data for the Team property here */
        },
      },
    });

    userObj.password = undefined as any;

    return NextResponse.json({
      userObj,
      message: "User has been created successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
