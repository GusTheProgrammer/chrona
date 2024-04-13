import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import { isAuth } from "@/lib/auth";

interface Params {
  params: {
    id: string;
  };
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *     - Users
 *     summary: Get a user's details
 *     description: Retrieves the detailed information of a user including role-based permissions.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routes:
 *                   type: array
 *                   description: List of user-specific client permissions.
 *                 menu:
 *                   type: array
 *                   description: Customized user menu based on permissions.
 *       404:
 *         description: User or role not found.
 *       500:
 *         description: Internal server error.
 *
 *   put:
 *     tags:
 *       - Users
 *     summary: Update a user
 *     description: Updates the details of an existing user including their role and password.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the user to update.
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
 *               email:
 *                 type: string
 *                 format: email
 *               confirmed:
 *                 type: boolean
 *               blocked:
 *                 type: boolean
 *               password:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userObj:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: User or role not found.
 *       409:
 *         description: Email already exists.
 *       500:
 *         description: Internal server error.
 *
 *   delete:
 *     tags:
 *        - Users
 *     summary: Delete a user
 *     description: Deletes a user from the system, restricted from deleting super admin users.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the user to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Cannot delete a super admin user.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const role = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        role: {
          select: {
            clientPermissions: {
              select: {
                menu: true,
                sort: true,
                path: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!role) return getErrorResponse("Role not found", 404);

    const routes = role.role.clientPermissions;

    interface Route {
      menu?: string;
      name?: string;
      path?: string;
      open?: boolean;
      sort?: number;
    }
    interface RouteChildren extends Route {
      children?: { menu?: string; name?: string; path?: string }[] | any;
    }
    const formatRoutes = (routes: Route[]) => {
      const formattedRoutes: RouteChildren[] = [];

      routes.forEach((route) => {
        if (route.menu === "hidden") return null;
        if (route.menu === "profile") return null;

        if (route.menu === "normal") {
          formattedRoutes.push({
            name: route.name,
            path: route.path,
            sort: route.sort,
          });
        } else {
          const found = formattedRoutes.find((r) => r.name === route.menu);
          if (found) {
            found.children.push({ name: route.name, path: route.path });
          } else {
            formattedRoutes.push({
              name: route.menu,
              sort: route.sort,
              open: false,
              children: [{ name: route.name, path: route.path }],
            });
          }
        }
      });

      return formattedRoutes;
    };

    const sortMenu: any = (menu: any[]) => {
      const sortedMenu = menu.sort((a, b) => {
        if (a.sort === b.sort) {
          if (a.name < b.name) {
            return -1;
          } else {
            return 1;
          }
        } else {
          return a.sort - b.sort;
        }
      });

      return sortedMenu.map((m) => {
        if (m.children) {
          return {
            ...m,
            children: sortMenu(m.children),
          };
        } else {
          return m;
        }
      });
    };

    return NextResponse.json({
      routes,
      menu: sortMenu(formatRoutes(routes) as any[]),
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const { name, confirmed, blocked, password, email, roleId } =
      await req.json();

    const role =
      roleId && (await prisma.role.findFirst({ where: { id: roleId } }));
    if (!role) return getErrorResponse("Role not found", 404);

    const user =
      email &&
      params.id &&
      (await prisma.user.findFirst({
        where: { email: email.toLowerCase(), id: { not: params.id } },
      }));
    if (user) return getErrorResponse("User already exists", 409);

    const userObj = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email: email.toLowerCase(),
        confirmed,
        blocked,
        roleId: role.id,
        ...(password && { password: await encryptPassword(password) }),
      },
    });

    if (!userObj) return getErrorResponse("User not found", 404);

    return NextResponse.json({
      userObj,
      message: "User has been updated successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await isAuth(req, params);

    const userObj =
      params.id &&
      (await prisma.user.findFirst({
        where: { id: params.id },
        include: {
          role: {
            select: {
              type: true,
            },
          },
        },
      }));
    if (!userObj) return getErrorResponse("User not found", 404);

    if (userObj.role.type === "SUPER_ADMIN")
      return getErrorResponse("You cannot delete a super admin", 403);

    const userRemove = await prisma.user.delete({
      where: {
        id: userObj.id,
      },
    });

    if (!userRemove) {
      return getErrorResponse("User not removed", 404);
    }

    userObj.password = undefined as any;

    return NextResponse.json({
      ...userObj,
      message: "User removed successfully",
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
