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
 * /api/client-permissions/{id}:
 *   put:
 *     tags:
 *       - Client Permissions
 *     summary: Update a client permission
 *     description: Modifies an existing client permission identified by its unique ID. Validates to ensure that the permission path does not conflict with others except its own.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the client permission to update.
 *         schema:
 *           type: string
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
 *         description: Client permission updated successfully.
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
 *                   example: "Client permission has been updated successfully"
 *       404:
 *         description: Client permission not found.
 *       409:
 *         description: Client permission path conflict.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const { name, sort, menu, path, description } = await req.json();

    const clientPermissionObj = await prisma.clientPermission.findUnique({
      where: { id: params.id },
    });
    if (!clientPermissionObj)
      return getErrorResponse("Client permission not found", 404);

    const checkExistence =
      path &&
      params.id &&
      (await prisma.clientPermission.findFirst({
        where: {
          path: path.toLowerCase(),
          id: { not: params.id },
        },
      }));
    if (checkExistence)
      return getErrorResponse("Client permission already exist");

    await prisma.clientPermission.update({
      where: { id: params.id },
      data: {
        name,
        sort: Number(sort),
        menu,
        description,
        path: path.toLowerCase(),
      },
    });

    return NextResponse.json({
      ...clientPermissionObj,
      message: "Client permission has been updated successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}

/**
 * @swagger
 * /api/client-permissions/{id}:
 *   delete:
 *     tags:
 *       - Client Permissions
 *     summary: Delete a client permission
 *     description: Removes a client permission identified by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the client permission to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client permission removed successfully.
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
 *                   example: "Client permission has been removed successfully"
 *       404:
 *         description: Client permission not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const clientPermissionObj = await prisma.clientPermission.delete({
      where: { id: params.id },
    });
    if (!clientPermissionObj)
      return getErrorResponse("Client permission not found", 404);

    return NextResponse.json({
      ...clientPermissionObj,
      message: "Client permission has been removed successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
