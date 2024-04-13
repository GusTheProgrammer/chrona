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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const option = searchParams.get("option");
    const employeeAndManagerPermissionIds = [
      "QYfSl9RBJ02x5VxXiLR6K", // Upload
      "dpC-jOpNCCp3otupfqHNe", // Scheduler (GET)
      "DQBaydVZ9uGjNGwxWQfU6", // Update Scheduler (PUT)
      "Q_5IQsDdbHohqQaqtRoEu", // Get Time-Off
      "VJp79ZZmkKQQTHf_1cqX-", // Get Time-Off per user id
      "KUVDwykdG-ckYvjbUWVS1", // Create a Time-Off request
      "YDXrifyxUrbALiCc_4iZG", // Delete a Time-Off request
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
