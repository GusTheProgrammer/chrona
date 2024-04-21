import {
  clientPermissions,
  permissions,
  roles,
  teams,
  users,
} from "@/config/data";

import { encryptPassword, getErrorResponse } from "@/lib/helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.db";
import wfmShifts from "@/config/wfmShifts";

/**
 * @swagger
 * /api/seeds:
 *   get:
 *     tags:
 *       - Seeds
 *     summary: Seed or reset the database
 *     description: |
 *       This endpoint manages seeding the database with initial data or resetting it based on provided options.
 *       It performs various actions like creating or resetting users, roles, permissions, and other entities.
 *       It requires a secret key to authorize the operation and accepts an option to reset data.
 *     parameters:
 *       - in: query
 *         name: secret
 *         required: true
 *         description: Authorization key required to execute seeding operations.
 *         schema:
 *           type: string
 *       - in: query
 *         name: option
 *         required: false
 *         description: Specify 'reset' to clear all existing data before seeding.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Database has been seeded or reset successfully. Returns counts of created entities.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Database seeded successfully"
 *                 team:
 *                   type: integer
 *                   description: Count of teams in the database.
 *                 users:
 *                   type: integer
 *                   description: Count of users in the database.
 *                 permissions:
 *                   type: integer
 *                   description: Count of permissions in the database.
 *                 clientPermissions:
 *                   type: integer
 *                   description: Count of client permissions in the database.
 *                 roles:
 *                   type: integer
 *                   description: Count of roles in the database.
 *                 shiftTypes:
 *                   type: integer
 *                   description: Count of shift types in the database.
 *       401:
 *         description: Unauthorized access, invalid or missing secret key.
 *       500:
 *         description: Internal server error or specific errors related to seeding operations.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const option = searchParams.get("option");
    const employeeAndManagerPermissionIds = [
      "QYfSl9RBJ02x5VxXiLR6K", // api/uploads | Upload
      "Fyph8SxjGayAHr8g65Rie", // api/profile | Get user profile
      "LMG211l6gxRRkjAHPvhgw", // api/profile/:id | Update user profile
      "dpC-jOpNCCp3otupfqHNe", // api/scheduler | Scheduler (GET)
      "DQBaydVZ9uGjNGwxWQfU6", // api/scheduler/:id | Scheduler (PUT)
      "Q_5IQsDdbHohqQaqtRoEu", // api/scheduler | Get Time-Off requests
      "VJp79ZZmkKQQTHf_1cqX-", // api/scheduler | Update a Time-Off request
      "KUVDwykdG-ckYvjbUWVS1", // api/scheduler | Create a Time-Off request
      "YDXrifyxUrbALiCc_4iZG", // api/scheduler | Delete a Time-Off request
      "UzN2L6RQ_gUM0_JN4ALkB", // api/users/:id | Get user client permissions
    ];
    const employeeAndManagerPermissionIdsClient = [
      "t-Snd86AW-TlIlMEDmYyt", // /account/profile | Profile page
      "Cw2eO5qIMCD_tt6uUdQdr", // /time-off | Time-off page
      "tEEdCt_Ghz5gWinY4RDNP", // /scheduler | Scheduler page
    ];

    if (!secret || secret !== "ts")
      return getErrorResponse("Invalid secret", 401);

    // Check duplicate permissions
    permissions.map((p) => {
      if (p.method && p.route) {
        const duplicate = permissions.filter(
          (p2) => p2.method === p.method && p2.route === p.route
        );
        if (duplicate.length > 1) {
          return getErrorResponse(
            `Duplicate permission: ${p.method} ${p.route}`,
            500
          );
        }
      }
    });

    // Delete all existing data if option is reset
    if (option === "reset") {
      await prisma.timeOff.deleteMany({});
      await prisma.scheduler.deleteMany({});
      await prisma.user.deleteMany({});
      await prisma.permission.deleteMany({});
      await prisma.clientPermission.deleteMany({});
      await prisma.role.deleteMany({});
      await prisma.team.deleteMany({});
      await prisma.shiftType.deleteMany({});
    }

    // Create shift types
    for (const shift of wfmShifts) {
      await prisma.shiftType.create({
        data: shift,
      });
    }

    // Create roles or update if exists
    await prisma.$transaction(async (prisma) => {
      await Promise.all(
        roles?.map(
          async (obj) =>
            await prisma.role.upsert({
              where: { id: obj.id },
              update: obj,
              create: obj,
            })
        )
      );
    });

    // Create teams
    for (const team of teams) {
      await prisma.team.upsert({
        where: { id: team.id },
        update: team,
        create: team,
      });
    }

    // Create users or update if exists
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          ...user,
          password: await encryptPassword({ password: user.password }),
          roleId: roles[0].id,
          teamId: teams[0].id,
        },
        update: {
          ...user,
          password: await encryptPassword({ password: user.password }),
          roleId: roles[0].id,
        },
      });

      await prisma.user.update({
        data: {
          roleId: roles[0].id,
        },
        where: { id: user.id },
      });
    }

    // Create permissions
    await Promise.all(
      permissions?.map(
        async (obj) =>
          await prisma.permission.upsert({
            where: { id: obj.id },
            update: obj as any,
            create: obj as any,
          })
      )
    );

    // Create client permissions
    await Promise.all(
      clientPermissions?.map(
        async (obj) =>
          await prisma.clientPermission.upsert({
            where: { id: obj.id },
            update: obj,
            create: obj,
          })
      )
    );

    // Create roles or update if exists
    await Promise.all(
      roles?.map(async (obj) => {
        const isSuperAdmin = obj.type === "SUPER_ADMIN";
        const isEmployeeOrManager =
          obj.type === "EMPLOYEE" || obj.type === "MANAGER";

        await prisma.role.upsert({
          where: { id: obj.id },
          update: {
            ...obj,
            ...(isSuperAdmin && {
              permissions: {
                connect: permissions.map((p) => ({ id: p.id })),
              },
              clientPermissions: {
                connect: clientPermissions.map((p) => ({ id: p.id })),
              },
            }),
            ...(isEmployeeOrManager && {
              permissions: {
                connect: employeeAndManagerPermissionIds.map((id) => ({ id })),
              },
              clientPermissions: {
                connect: employeeAndManagerPermissionIdsClient.map((id) => ({
                  id,
                })),
              },
            }),
          },
          create: {
            ...obj,
            ...(isSuperAdmin && {
              permissions: {
                connect: permissions.map((p) => ({ id: p.id })),
              },
              clientPermissions: {
                connect: clientPermissions.map((p) => ({ id: p.id })),
              },
            }),
            ...(isEmployeeOrManager && {
              permissions: {
                connect: employeeAndManagerPermissionIds.map((id) => ({ id })),
              },
              clientPermissions: {
                connect: employeeAndManagerPermissionIdsClient.map((id) => ({
                  id,
                })),
              },
            }),
          },
        });
      })
    );

    return NextResponse.json({
      message: "Database seeded successfully",
      team: await prisma.team.count({}),
      users: await prisma.user.count({}),
      permissions: await prisma.permission.count({}),
      clientPermissions: await prisma.clientPermission.count({}),
      roles: await prisma.role.count({}),
      shiftTypes: await prisma.shiftType.count({}),
    });
  } catch ({ status = 500, message }: any) {
    return getErrorResponse(message, status);
  }
}
