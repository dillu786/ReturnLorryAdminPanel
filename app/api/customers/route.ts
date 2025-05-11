import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    
    // Get search and filter parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'CreatedDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause for filtering
    const where = {
      AND: [
        // Search in name and email
        search ? {
          OR: [
            { Name: { contains: search, mode: 'insensitive' } },
            //{ Email: { contains: search, mode: 'insensitive' } },
            { MobileNumber: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        // Filter by status if provided
        status ? { Status: status } : {}
      ]
    };

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    // Get paginated users with related data
    const users = await prisma.user.findMany({
      where,
      include: {
        Bookings: {
          select: {
            Id: true,
            Status: true,
            CreatedDateTime: true
          }
        }
      },
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder
      }
    });

   console.log("test"+users);
    // Transform the data to include additional computed fields
    const transformedUsers = await Promise.all(
      users.map(async user => ({
        ...user,
        rides: await prisma.bookings.count({
          where: {
            UserId: user.Id
          }
        }),
        status: user.Status || 'active',
        joined: new Date(user.CreatedDate).toLocaleDateString()
      }))
    );
    
    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

