import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { QueryMode, prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/client-permissions:
 *   get:
 *     tags:
 *       - Client Permissions
 *     summary: Retrieve client permissions
 *     description: Fetches client permissions based on optional search queries and pagination parameters.
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
 *         description: A list of client permissions with pagination details.
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
 *                       description:
 *                         type: string
 *                       sort:
 *                         type: integer
 *                       menu:
 *                         type: string
 *                       path:
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
      prisma.clientPermission.findMany({
        where: query,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.clientPermission.count({ where: query }),
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
 * /api/client-permissions:
 *   post:
 *     tags:
 *       - Client Permissions
 *     summary: Create a client permission
 *     description: Adds a new client permission to the system. Ensures that the permission path does not already exist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sort, menu, path, description]
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the permission.
 *               sort:
 *                 type: integer
 *                 description: Sort order for displaying permissions.
 *               menu:
 *                 type: string
 *                 description: Menu category for the permission.
 *               path:
 *                 type: string
 *                 description: Unique path identifier for the permission.
 *               description:
 *                 type: string
 *                 description: Description of the permission.
 *     responses:
 *       200:
 *         description: Client permission created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 sort:
 *                   type: integer
 *                 menu:
 *                   type: string
 *                 path:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *       409:
 *         description: Client permission already exists.
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: Request) {
  try {
    await isAuth(req);

    const { name, sort, menu, path, description } = await req.json();

    const checkExistence =
      path &&
      (await prisma.clientPermission.findFirst({
        where: { path: path.toLowerCase() },
      }));
    if (checkExistence)
      return getErrorResponse("Client permission already exists", 409);

    const clientPermissionObj = await prisma.clientPermission.create({
      data: {
        name,
        description,
        sort: Number(sort),
        menu,
        path: path.toLowerCase(),
      },
    });

    return NextResponse.json({
      ...clientPermissionObj,
      message: "Client permission created successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
