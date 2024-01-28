import {encryptPassword, getErrorResponse} from "@/lib/helpers";
import {NextResponse} from "next/server";
import {any} from "zod";
import * as console from "console";

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    // Hardcoded roleId for default user role
    const defaultRoleId = 'a75POUlJzMDmaJtz0JCxp'; // Replace with your actual default role ID

    // Basic validation
    if (password !== confirmPassword) {
      return getErrorResponse('Passwords do not match', 400);
    }

        // Check if the user already exists
        const existingUser = await prisma.user.findFirst({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) return getErrorResponse('User already exists', 409);

        // Create the new user
        const userObj = await prisma.user.create({
            data: {
                name: name,
                email: email.toLowerCase(),
                roleId: defaultRoleId,
                password: await encryptPassword({ password }),
                image: `https://ui-avatars.com/api/?uppercase=true&name=${name}&background=random&color=random&size=128`,
                confirmed: true,
                blocked: false,
            },
        });

        // Do not return the password in the response
        userObj.password = undefined as any;

        return NextResponse.json({
            userObj,
            message: 'User has been created successfully',
        });
    } catch ({ status = 500, message }: any) {
        return getErrorResponse(message, status);
    }
}
