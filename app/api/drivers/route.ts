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
            { Email: { contains: search, mode: 'insensitive' } },
            { MobileNumber: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        // Filter by status if provided
        status ? { Status: status } : {}
      ]
    };

    // Get total count for pagination
    const totalCount = await prisma.driver.count({ where });

    // Get paginated drivers with related data
    const drivers = await prisma.driver.findMany({
      where,
      include: {
        Bookings: true,
        OwnerDriver: true
      },
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    // Transform the data to include additional computed fields
    const transformedDrivers = drivers.map(driver => ({
      ...driver,
     // rides: driver.Bookings?.length || 0,
     // status: driver.Status || 'active'
    }));

    return NextResponse.json({
      drivers: transformedDrivers,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

// Helper function to calculate driver rating
function calculateDriverRating(driver: any) {
  // Implement your rating calculation logic here
  // This is just a placeholder
  return 4.5;
}

