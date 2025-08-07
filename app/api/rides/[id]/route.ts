import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rideId = parseInt(params.id);

    const ride = await prisma.bookings.findUnique({
      where: { Id: rideId },
      include: {
        User: {
          select: {
            Id: true,
            Name: true,
            Email: true,
            MobileNumber: true
          }
        },
        Driver: {
          select: {
            Id: true,
            Name: true,
            Email: true,
            MobileNumber: true,
            IsOnline: true
          }
        },
        Vehicle: {
          select: {
            Id: true,
            Model: true,
            VehicleNumber: true,
            VehicleType: true
          }
        },
        FareNegotiations: {
          include: {
            Driver: {
              select: {
                Id: true,
                Name: true,
                Email: true
              }
            },
            Owner: {
              select: {
                Id: true,
                Name: true,
                Email: true
              }
            }
          }
        }
      }
    });

    if (!ride) {
      return NextResponse.json(
        { error: "Ride not found" },
        { status: 404 }
      );
    }

    // Transform the data to include additional computed fields
    const transformedRide = {
      ...ride,
      totalDistance: ride.Distance ? `${ride.Distance} Km` : '0 Km',
      estimatedDuration: calculateEstimatedDuration(ride.Distance),
      status: ride.Status,
      createdAt: new Date(ride.CreatedDateTime).toLocaleDateString(),
      updatedAt: new Date(ride.UpdatedDateTime).toLocaleDateString()
    };

    return NextResponse.json({
      success: true,
      ride: transformedRide
    });
  } catch (error) {
    console.error('Error fetching ride:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ride' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rideId = parseInt(params.id);
    const body = await request.json();
    const { action, ...updateData } = body;

    let updatedRide;

    switch (action) {
      case 'update':
        // Clean up the update data to only include valid fields
        const cleanUpdateData: any = {};
        if (updateData.Status) cleanUpdateData.Status = updateData.Status;
        if (updateData.Fare) cleanUpdateData.Fare = updateData.Fare;
        if (updateData.PickUpLocation) cleanUpdateData.PickUpLocation = updateData.PickUpLocation;
        if (updateData.DropLocation) cleanUpdateData.DropLocation = updateData.DropLocation;
        if (updateData.DriverId) cleanUpdateData.DriverId = updateData.DriverId;
        if (updateData.VehicleId) cleanUpdateData.VehicleId = updateData.VehicleId;
        
        updatedRide = await prisma.bookings.update({
          where: { Id: rideId },
          data: cleanUpdateData
        });
        break;

      case 'cancel':
        updatedRide = await prisma.bookings.update({
          where: { Id: rideId },
          data: { Status: 'CANCELLED' }
        });
        break;

      case 'complete':
        updatedRide = await prisma.bookings.update({
          where: { Id: rideId },
          data: { Status: 'COMPLETED' }
        });
        break;

      case 'assign-driver':
        if (!updateData.driverId) {
          return NextResponse.json(
            { error: "Driver ID is required" },
            { status: 400 }
          );
        }
        updatedRide = await prisma.bookings.update({
          where: { Id: rideId },
          data: { DriverId: updateData.driverId }
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
      message: "Ride updated successfully",
      ride: updatedRide
    });
  } catch (error) {
    console.error('Error updating ride:', error);
    return NextResponse.json(
      { error: 'Failed to update ride' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rideId = parseInt(params.id);

    // Check if ride exists
    const ride = await prisma.bookings.findUnique({
      where: { Id: rideId }
    });

    if (!ride) {
      return NextResponse.json(
        { error: "Ride not found" },
        { status: 404 }
      );
    }

    // Check if ride can be deleted (only cancelled rides can be deleted)
    if (ride.Status !== 'CANCELLED') {
      return NextResponse.json(
        { error: "Only cancelled rides can be deleted" },
        { status: 400 }
      );
    }

    // Delete the ride
    await prisma.bookings.delete({
      where: { Id: rideId }
    });

    return NextResponse.json({
      success: true,
      message: "Ride deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting ride:', error);
    return NextResponse.json(
      { error: 'Failed to delete ride' },
      { status: 500 }
    );
  }
}

// Helper function to calculate estimated duration based on distance
function calculateEstimatedDuration(distance: string): string {
  // Simple calculation: assume average speed of 30 km/h
  const distanceInKm = parseFloat(distance) || 0;
  const durationInHours = distanceInKm / 30;
  const hours = Math.floor(durationInHours);
  const minutes = Math.round((durationInHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
} 