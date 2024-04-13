import { isAuth } from "@/lib/auth";
import { getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { QueryMode, prisma } from "@/lib/prisma.db";

interface Params {
  params: {
    id: string;
  };
}

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Update a specific role
 *     description: Updates an existing role identified by its unique ID. Allows modifying role name, permissions, and client permissions.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the role to update.
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
 *                 description: The new name of the role.
 *               description:
 *                 type: string
 *                 description: A brief description of the role.
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permission IDs to be associated with the role.
 *               clientPermissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of client permission IDs to be associated with the role.
 *     responses:
 *       200:
 *         description: Role updated successfully. Returns updated role details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role updated successfully"
 *       400:
 *         description: Role not found or role with the same name already exists.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const {
      name,
      permissions: permissionRequest,
      clientPermissions: clientPermissionRequest,
      description,
    } = await req.json();

    let type;
    let permission = [];
    let clientPermission = [];
    if (name) type = name?.toUpperCase().trim().replace(/\s+/g, "_");

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

    const object = await prisma.role.findUnique({
      where: { id: params.id },
    });
    if (!object) return getErrorResponse("Role not found", 400);

    const checkExistence =
      name &&
      type &&
      params.id &&
      (await prisma.role.findFirst({
        where: {
          name: { equals: name, mode: QueryMode.insensitive },
          type: { equals: type, mode: QueryMode.insensitive },
          id: { not: params.id },
        },
      }));
    if (checkExistence) return getErrorResponse("Role already exist");

    // prepare for disconnect
    const oldPermissions = await prisma.role.findUnique({
      where: { id: params.id },
      select: {
        permissions: { select: { id: true } },
        clientPermissions: { select: { id: true } },
      },
    });

    await prisma.role.update({
      where: { id: params.id },
      data: {
        name,
        description,
        type,
        permissions: {
          disconnect: oldPermissions?.permissions?.map((pre) => ({
            id: pre.id,
          })),
          connect: permission?.map((pre) => ({ id: pre })),
        },
        clientPermissions: {
          disconnect: oldPermissions?.clientPermissions?.map((client) => ({
            id: client.id,
          })),
          connect: clientPermission?.map((client) => ({ id: client })),
        },
      },
    });

    return NextResponse.json({
      ...object,
      message: "Role updated successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Delete a specific role
 *     description: Deletes a role identified by its unique ID, with checks to prevent deletion of critical system roles such as 'SUPER_ADMIN'.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the role to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role deleted successfully"
 *       400:
 *         description: Cannot delete 'SUPER_ADMIN' role or other critical roles.
 *       404:
 *         description: Role not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const checkIfSuperAdmin = await prisma.role.findUnique({
      where: { id: params.id },
    });
    if (checkIfSuperAdmin && checkIfSuperAdmin?.type === "SUPER_ADMIN")
      return getErrorResponse("Role is super admin", 400);

    const object = await prisma.role.delete({
      where: { id: params.id },
    });

    if (!object) return getErrorResponse("Role not found", 404);

    return NextResponse.json({
      ...object,
      message: "Role deleted successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
