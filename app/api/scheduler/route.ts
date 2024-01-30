import { isAuth } from '@/lib/auth';
import { getErrorResponse } from '@/lib/helpers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.db';

export async function GET(req: Request) {
    try {
        // await isAuth(req);

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId'); // Get the user ID from query params

        if (!userId) {
            return getErrorResponse("User ID is required", 400);
        }

        const q = searchParams.get('q');

        const query = q
            ? { user_id: userId, fullname: { contains: q } } // Filter by user_id and fullname if query is present
            : { user_id: userId }; // Filter only by user_id

        const page = parseInt(searchParams.get('page') as string) || 1;
        const pageSize = parseInt(searchParams.get('limit') as string) || 25;
        const skip = (page - 1) * pageSize;

        const [result, total] = await Promise.all([
            prisma.schedulerCalendar.findMany({
                where: query,
                skip,
                take: pageSize,
                orderBy: { datestamp: 'desc' },
                // Update the selection as per SchedulerCalendar fields
            }),
            prisma.schedulerCalendar.count({ where: query }),
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
