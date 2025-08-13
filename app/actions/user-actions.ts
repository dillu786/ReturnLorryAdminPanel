"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/db/prisma/prisma"

export async function toggleUserStatus(userId: number, action: 'activate' | 'deactivate' | 'block') {
  try {
    const user = await prisma.user.findUnique({
      where: { Id: userId }
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    let isActive: boolean
    switch (action) {
      case 'activate':
        isActive = true
        break
      case 'deactivate':
      case 'block':
        isActive = false
        break
      default:
        return { success: false, error: "Invalid action" }
    }

    await prisma.user.update({
      where: { Id: userId },
      data: { IsActive: isActive }
    })

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user status:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getUser(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { Id: userId },
      include: {
        Bookings: {
          include: {
            Driver: true,
            Vehicle: true
          }
        }
      }
    })

    return { success: true, user }
  } catch (error) {
    console.error("Error fetching user:", error)
    return { success: false, error: "Failed to fetch user details" }
  }
} 