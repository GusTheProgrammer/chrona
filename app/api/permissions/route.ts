import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { QueryMode, prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Retrieve permissions
 *     description: Fetches permissions based on optional search queries and pagination parameters. Supports search by name.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         description: Search query to filter permissions by name.
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
 *         description: Number of permissions per page.
 *         schema:
 *           type: integer
 *           default: 25
 *     responses:
 *       200:
 *         description: A list of permissions with pagination details.
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
 *                       method:
 *                         type: string
 *                       route:
 *                         type: string
 *                       description:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: Request) {
  try {
    await isAuth(req);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    const query = q
      ? { name: { contains: q, mode: QueryMode.insensitive } }
      : {};

    const page = parseInt(searchParams.get("page") as string) || 1;
    const pageSize = parseInt(searchParams.get("limit") as string) || 25;
    const skip = (page - 1) * pageSize;

    const [result, total] = await Promise.all([
      prisma.permission.findMany({
        where: query,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.permission.count({ where: query }),
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
 * /api/permissions:
 *   post:
 *     tags:
 *       - Permissions
 *     summary: Create a new permission
 *     description: Adds a new permission to the system. Ensures that the combination of method and route does not already exist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, method, route, description]
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the permission.
 *               method:
 *                 type: string
 *                 description: The HTTP method associated with the permission (GET, POST, PUT, etc.).
 *               route:
 *                 type: string
 *                 description: The API route associated with the permission.
 *               description:
 *                 type: string
 *                 description: A brief description of what the permission allows.
 *     responses:
 *       200:
 *         description: Permission created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 method:
 *                   type: string
 *                 route:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   example: "Permission created successfully"
 *       409:
 *         description: Permission already exists with the specified method and route.
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: Request) {
  try {
    await isAuth(req);

    const { name, method, route, description } = await req.json();

    const checkExistence =
      method &&
      route &&
      (await prisma.permission.findFirst({
        where: {
          method: method.toUpperCase(),
          route: route.toLowerCase(),
        },
      }));
    if (checkExistence) return getErrorResponse("Permission already exist");

    const permissionObj = await prisma.permission.create({
      data: {
        name,
        method: method.toUpperCase(),
        route: route.toLowerCase(),
        description,
      },
    });

    return NextResponse.json({
      ...permissionObj,
      message: "Permission created successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
