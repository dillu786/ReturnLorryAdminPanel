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
    const accountStatus = searchParams.get('accountStatus');
    const onlineStatus = searchParams.get('onlineStatus');
    const verificationStatus = searchParams.get('verificationStatus');
    const sortBy = searchParams.get('sortBy') || 'CreatedDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause for filtering
    const whereConditions: any[] = [];
    
    // Search in name, email, and mobile number
    if (search) {
      whereConditions.push({
        OR: [
          { Name: { contains: search, mode: 'insensitive' } },
          { Email: { contains: search, mode: 'insensitive' } },
          { MobileNumber: { contains: search, mode: 'insensitive' } }
        ]
      });
    }
    
    // Filter by account status if provided
    if (accountStatus) {
      switch (accountStatus) {
        case 'active':
          whereConditions.push({ IsActive: true });
          break;
        case 'inactive':
          whereConditions.push({ IsActive: false });
          break;
      }
    }

    // Filter by online status if provided
    if (onlineStatus) {
      switch (onlineStatus) {
        case 'online':
          whereConditions.push({ IsOnline: true });
          break;
        case 'offline':
          whereConditions.push({ IsOnline: false });
          break;
      }
    }

    // Filter by verification status if provided
    if (verificationStatus) {
      switch (verificationStatus) {
        case 'verified':
          whereConditions.push({
            AND: [
              { IsDLFrontImageVerified: true },
              { IsDLBackImageVerified: true },
              { IsPanImgVerified: true },
              { IsFSAdhaarImgVerified: true },
              { IsBSAdhaarImgVerified: true }
            ]
          });
          break;
        case 'pending':
          whereConditions.push({
            OR: [
              { IsDLFrontImageVerified: false },
              { IsDLBackImageVerified: false },
              { IsPanImgVerified: false },
              { IsFSAdhaarImgVerified: false },
              { IsBSAdhaarImgVerified: false }
            ]
          });
          break;
        case 'partially':
          // Partially verified means at least one document is verified but not all
          whereConditions.push({
            AND: [
              {
                OR: [
                  { IsDLFrontImageVerified: true },
                  { IsDLBackImageVerified: true },
                  { IsPanImgVerified: true },
                  { IsFSAdhaarImgVerified: true },
                  { IsBSAdhaarImgVerified: true }
                ]
              },
              {
                OR: [
                  { IsDLFrontImageVerified: false },
                  { IsDLBackImageVerified: false },
                  { IsPanImgVerified: false },
                  { IsFSAdhaarImgVerified: false },
                  { IsBSAdhaarImgVerified: false }
                ]
              }
            ]
          });
          break;
      }
    }
    
    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Get total count for pagination
    const totalCount = await prisma.driver.count({ where });

    // Get paginated drivers with related data
    const drivers = await prisma.driver.findMany({
      where,
      include: {
        Bookings: true,
        DriverOwner: true
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

