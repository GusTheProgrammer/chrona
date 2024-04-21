import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { QueryMode, prisma } from "@/lib/prisma.db";

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Retrieve roles
 *     description: Fetches roles from the database based on optional search queries and pagination parameters. Includes associated permissions for each role.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         description: Search query to filter roles by name.
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
 *         description: Number of roles per page.
 *         schema:
 *           type: integer
 *           default: 25
 *     responses:
 *       200:
 *         description: A list of roles with pagination details.
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
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                       clientPermissions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
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
      prisma.role.findMany({
        where: query,
        include: {
          permissions: true,
          clientPermissions: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.role.count({ where: query }),
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
 * /api/roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Create a new role
 *     description: Adds a new role with permissions and client permissions details to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, permissions, clientPermissions]
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the role.
 *               description:
 *                 type: string
 *                 description: A brief description of the role.
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of permission IDs to be associated with the role.
 *               clientPermissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of client permission IDs to be associated with the role.
 *     responses:
 *       200:
 *         description: Role created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error, such as missing required fields or role already exists.
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: Request) {
  try {
    await isAuth(req);

    const {
      name,
      description,
      permissions: permissionRequest,
      clientPermissions: clientPermissionRequest,
    } = await req.json();

    let type;
    let permission = [];
    let clientPermission = [];
    if (name) type = name.toUpperCase().trim().replace(/\s+/g, "_");

    if (permissionRequest) {
      if (Array.isArray(permissionRequest)) {
        permission = permissionRequest;
      } else {
        permission = [permissionRequest];
      }
    }

    if (clientPermissionRequest) {
      if (Array.isArray(clientPermissionRequest)) {
        clientPermission = clientPermissionRequest;
      } else {
        clientPermission = [clientPermissionRequest];
      }
    }

    permission = permission?.filter((per) => per);
    clientPermission = clientPermission?.filter((client) => client);

    const checkExistence =
      name &&
      (await prisma.role.findFirst({
        where: { name: { equals: name, mode: QueryMode.insensitive } },
      }));
    if (checkExistence) return getErrorResponse("Role already exist");

    const object = await prisma.role.create({
      data: {
        name,
        description,
        type,
        permissions: {
          connect: permission?.map((pre) => ({ id: pre })),
        },
        clientPermissions: {
          connect: clientPermission?.map((client) => ({ id: client })),
        },
      },
    });

    return NextResponse.json({
      ...object,
      message: "Role created successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
