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
    const totalCount = await prisma.owner.count({ where });

    // Get paginated owners with related data
    const owners = await prisma.owner.findMany({
      where,
      include: {
        OwnerDriver: {
          select: {
            Id: true,
            Driver: true,
            Owner: true
          }
        }
      },
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder
      }
    });
    console.log("owners"+owners);
    // Transform the data to include additional computed fields
    const transformedOwners = await Promise.all(owners.map( async owner => ({
      ...owner,
      drivers: await prisma.ownerDriver.count({
        where:{
          OwnerId: owner.Id             
        }
      }),
      status: owner.Status || 'active',
      joined: new Date(owner.CreatedDate).toLocaleDateString()
    })));

    return NextResponse.json({
      owners: transformedOwners,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owners' },
      { status: 500 }
    );
  }
}