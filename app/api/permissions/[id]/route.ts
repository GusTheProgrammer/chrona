import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";

interface Params {
  params: {
    id: string;
  };
}

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     tags:
 *       - Permissions
 *     summary: Update a specific permission
 *     description: Updates an existing permission identified by its unique ID. Ensures that the combination of method and route does not conflict with others except its own.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the permission to update.
 *         schema:
 *           type: string
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
 *         description: Permission updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Permission has been updated successfully"
 *       404:
 *         description: Permission not found.
 *       409:
 *         description: Permission conflict with an existing method and route.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const { name, method, route, description } = await req.json();

    const permissionObj = await prisma.permission.findUnique({
      where: { id: params.id },
    });

    if (!permissionObj) return getErrorResponse("Permission not found", 404);

    const checkExistence =
      method &&
      route &&
      params.id &&
      (await prisma.permission.findFirst({
        where: {
          method: method.toUpperCase(),
          route: route.toLowerCase(),
          id: { not: params.id },
        },
      }));
    if (checkExistence) return getErrorResponse("Permission already exist");

    await prisma.permission.update({
      where: { id: params.id },
      data: {
        name,
        method: method.toUpperCase(),
        description,
        route: route.toLowerCase(),
      },
    });

    return NextResponse.json({
      ...permissionObj,
      message: "Permission has been updated successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     tags:
 *       - Permissions
 *     summary: Delete a specific permission
 *     description: Removes a permission identified by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the permission to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Permission has been removed successfully"
 *       404:
 *         description: Permission not found or not removed.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const permissionObj = await prisma.permission.delete({
      where: { id: params.id },
    });

    if (!permissionObj) return getErrorResponse("Permission not removed", 404);

    return NextResponse.json({
      ...permissionObj,
      message: "Permission has been removed successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
