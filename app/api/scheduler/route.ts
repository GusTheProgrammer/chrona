import { isAuth } from '@/lib/auth';
import { getErrorResponse } from '@/lib/helpers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.db';

export async function GET(req: Request) {
    try {
        await isAuth(req);

        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get('teamId'); // Get the team ID from query params

        if (!teamId) {
            return getErrorResponse("Team ID is required", 400);
        }

        const page = parseInt(searchParams.get('page') as string) || 1;
        const pageSize = parseInt(searchParams.get('limit') as string) || 7;

        // Fetch all records for the team
        const records = await prisma.schedulerCalendar.findMany({
            where: { team_id: teamId },
            orderBy: { datestamp: 'asc' },
        });

        // Group records by date
        const groupedByDate = records.reduce((acc, record) => {
            const date = record.datestamp.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(record);
            return acc;
        }, {});

        const dates = Object.keys(groupedByDate);
        const totalDates = dates.length;
        const currentDateIndex = dates.indexOf(new Date().toISOString().split('T')[0]);

        // Calculate startIndex and endIndex based on page number
        let startIndex, endIndex;
        if (page >= 0) {
            // For positive or zero page number, fetch future dates
            startIndex = Math.min(totalDates, currentDateIndex + ((page - 1) * pageSize));
            endIndex = startIndex + pageSize;
        } else {
            // For negative page number, fetch previous dates
            endIndex = Math.max(0, currentDateIndex + (page * pageSize));
            startIndex = Math.max(0, endIndex - pageSize);
        }

        const limitedDays = dates.slice(startIndex, endIndex).reduce((acc, date) => {
            acc[date] = groupedByDate[date];
            return acc;
        }, {});

        const pages = Math.ceil(totalDates / pageSize);

        return NextResponse.json({
            startIndex: startIndex + 1,
            endIndex: endIndex,
            count: Object.keys(limitedDays).length,
            page,
            pages,
            total: totalDates,
            data: limitedDays,
        });
    } catch ({ status = 500, message }: any) {
        return getErrorResponse(message, status);
    }
}
