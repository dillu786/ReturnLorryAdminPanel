"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/db/prisma/prisma"

export async function updateRideStatus(rideId: number, status: 'COMPLETED' | 'CANCELLED') {
  try {
    const ride = await prisma.bookings.findUnique({
      where: { Id: rideId }
    })

    if (!ride) {
      return { success: false, error: "Ride not found" }
    }

    await prisma.bookings.update({
      where: { Id: rideId },
      data: { Status: status }
    })

    revalidatePath("/rides")
    return { success: true }
  } catch (error) {
    console.error("Error updating ride status:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getRide(rideId: number) {
  try {
    const ride = await prisma.bookings.findUnique({
      where: { Id: rideId },
      include: {
        User: true,
        Driver: true,
        Vehicle: true
      }
    })

    return { success: true, ride }
  } catch (error) {
    console.error("Error fetching ride:", error)
    return { success: false, error: "Failed to fetch ride details" }
  }
} 