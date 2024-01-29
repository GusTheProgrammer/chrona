import { isAuth } from '@/lib/auth'
import { getErrorResponse } from '@/lib/helpers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.db'

export async function GET(req: Request) {
    try {
        // await isAuth(req)

        const { searchParams } = new URL(req.url)
        const q = searchParams.get('q')

        // Update the query to match SchedulerCalendar fields
        const query = q
            ? { fullname: { contains: q } } // Assuming you want to search by fullname
            : {}

        const page = parseInt(searchParams.get('page') as string) || 1
        const pageSize = parseInt(searchParams.get('limit') as string) || 25
        const skip = (page - 1) * pageSize

        const [result, total] = await Promise.all([
            prisma.schedulerCalendar.findMany({
                where: query,
                skip,
                take: pageSize,
                orderBy: { datestamp: 'desc' },
                // Update the selection as per SchedulerCalendar fields
            }),
            prisma.schedulerCalendar.count({ where: query }),
        ])

        const pages = Math.ceil(total / pageSize)

        return NextResponse.json({
            startIndex: skip + 1,
            endIndex: skip + result.length,
            count: result.length,
            page,
            pages,
            total,
            data: result,
        })
    } catch ({ status = 500, message }: any) {
        return getErrorResponse(message, status)
    }
}
