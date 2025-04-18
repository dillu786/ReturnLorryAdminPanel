"use server"

import { getUserPermissionCodes } from "@/db/permisssions"

export async function getUserPermissionsAction(userId: string) {
  try {
    const permissionCodes = await getUserPermissionCodes(userId)
    return { success: true, permissions: permissionCodes }
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    return { success: false, error: "Failed to fetch permissions" }
  }
} 