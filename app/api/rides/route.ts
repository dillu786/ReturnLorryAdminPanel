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
    const sortBy = searchParams.get('sortBy') || 'CreatedDateTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause for filtering
    const where = {
      AND: [
        // Search in user and driver names, locations
        search ? {
          OR: [
            { User: { Name: { contains: search, mode: 'insensitive' } } },
            { Driver: { Name: { contains: search, mode: 'insensitive' } } },
            { PickUpLocation: { contains: search, mode: 'insensitive' } },
            { DropLocation: { contains: search, mode: 'insensitive' } },
            { Product: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        // Filter by status if provided
        status ? { Status: status } : {}
      ]
    };

    // Get total count for pagination
    const totalCount = await prisma.bookings.count({ where });

    // Get paginated rides with related data
    const rides = await prisma.bookings.findMany({
      where,
      select: {
        Id: true,
        PickUpLocation: true,
        DropLocation: true,
        Product: true,
        Distance: true,
        Status: true,
        PaymentMode: true,
        BookingTime: true,
        Fare: true,
        StartTime: true,
        CreatedDateTime: true,
        Driver: {
          select: {
            Id: true,
            Name: true,
            MobileNumber: true,
            Email: true
          }
        },
        User: {
          select: {
            Id: true,
            Name: true,
            MobileNumber: true,
            //Email: true
          }
        },
        Vehicle: {
          select: {
            Id: true,
            Model: true,
            //Number: true
          }
        }
      },
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    // Transform the data to include additional computed fields
    const transformedRides = rides.map(ride => ({
      ...ride,
      // Convert string amounts to numbers for proper formatting
      Fare: parseFloat(ride.Fare) || 0,
      Distance: parseFloat(ride.Distance) || 0,
      // Add duration if needed
      Duration: calculateDuration(ride.StartTime, ride.BookingTime)
    }));
 
    return NextResponse.json({
      rides: transformedRides,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
}

// Helper function to calculate duration between two dates
function calculateDuration(startTime: Date, bookingTime: Date): string {
  if (!startTime || !bookingTime) return '0h 0m';
  
  const duration = new Date(startTime).getTime() - new Date(bookingTime).getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}