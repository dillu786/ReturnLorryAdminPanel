"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/db/prisma/prisma"

export async function toggleOwnerStatus(ownerId: number, isActive: boolean) {
  try {
    const owner = await prisma.owner.findUnique({
      where: { Id: ownerId }
    })

    if (!owner) {
      return { success: false, error: "Owner not found" }
    }

    await prisma.owner.update({
      where: { Id: ownerId },
      data: { IsActive: isActive }
    })

    revalidatePath("/owners")
    return { success: true }
  } catch (error) {
    console.error("Error updating owner status:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getOwner(ownerId: number) {
  try {
    const owner = await prisma.owner.findUnique({
      where: { Id: ownerId },
      include: {
        OwnerDriver: {
          include: {
            Driver: true
          }
        },
        OwnerVehicles: {
          include: {
            Vehicle: true
          }
        }
      }
    })

    return { success: true, owner }
  } catch (error) {
    console.error("Error fetching owner:", error)
    return { success: false, error: "Failed to fetch owner details" }
  }
} 