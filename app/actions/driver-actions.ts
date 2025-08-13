"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/db/prisma/prisma"

export async function toggleDriverStatus(driverId: number, isActive: boolean) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { Id: driverId }
    })

    if (!driver) {
      return { success: false, error: "Driver not found" }
    }

    await prisma.driver.update({
      where: { Id: driverId },
      data: { IsActive: isActive }
    })

    revalidatePath("/drivers")
    return { success: true }
  } catch (error) {
    console.error("Error updating driver status:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getDriver(driverId: number) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { Id: driverId },
      include: {
        DriverVehicles: {
          include: {
            Vehicle: true
          }
        },
        Bookings: {
          include: {
            User: true,
            Vehicle: true
          }
        }
      }
    })

    return { success: true, driver }
  } catch (error) {
    console.error("Error fetching driver:", error)
    return { success: false, error: "Failed to fetch driver details" }
  }
} 