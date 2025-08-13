import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    const user = await prisma.user.findUnique({
      where: { Id: userId },
      include: {
        Bookings: {
          select: {
            Id: true,
            Status: true,
            CreatedDateTime: true,
            Fare: true,
            PickUpLocation: true,
            DropLocation: true,
          },
          orderBy: {
            CreatedDateTime: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Transform the data to include additional computed fields
    const transformedUser = {
      ...user,
      rides: user.Bookings.length,
      totalSpent: user.Bookings.reduce((sum: number, booking: any) => sum + (parseFloat(booking.Fare) || 0), 0),
      status: user.IsActive ? 'active' : 'inactive',
      joined: new Date(user.CreatedDate).toLocaleDateString(),
      lastRide: user.Bookings[0] ? new Date(user.Bookings[0].CreatedDateTime).toLocaleDateString() : null
    };

    return NextResponse.json({
      success: true,
      user: transformedUser
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();
    const { action, ...updateData } = body;

    let updatedUser;

    switch (action) {
      case 'update':
        // Clean up the update data to only include valid fields
        const cleanUpdateData: any = {};
        if (updateData.Name) cleanUpdateData.Name = updateData.Name;
        if (updateData.Email !== undefined) cleanUpdateData.Email = updateData.Email;
        if (updateData.MobileNumber) cleanUpdateData.MobileNumber = updateData.MobileNumber;
        if (updateData.DOB) cleanUpdateData.DOB = new Date(updateData.DOB);
        if (updateData.Gender) cleanUpdateData.Gender = updateData.Gender;
        
        updatedUser = await prisma.user.update({
          where: { Id: userId },
          data: cleanUpdateData
        });
        break;

      case 'activate':
        updatedUser = await prisma.user.update({
          where: { Id: userId },
          data: { IsActive: true }
        });
        break;

      case 'deactivate':
        updatedUser = await prisma.user.update({
          where: { Id: userId },
          data: { IsActive: false }
        });
        break;

      case 'block':
        updatedUser = await prisma.user.update({
          where: { Id: userId },
          data: { IsActive: false }
        });
        break;

      case 'reset-password':
        if (!updateData.password) {
          return NextResponse.json(
            { error: "Password is required" },
            { status: 400 }
          );
        }
        // In a real app, you would hash the password here
        updatedUser = await prisma.user.update({
          where: { Id: userId },
          data: { Password: updateData.password }
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

 