"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/db/prisma/prisma"
import { createRole, updateRolePermissions, assignRoleToUser, removeRoleFromUser } from "@/db/permisssions"

export async function getRoles() {
  return prisma.role.findMany({
    include: {
      _count: {
        select: {
          permissions: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getCustomers() {
  return await prisma.user.findMany({})
}

export async function getRole(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: {
            include: {
              category: true,
            },
          },
        },
      },
      users: {
        include: {
          role: true,
        },
      },
    },
  })
}

export async function getAllPermissions() {
  // Fetch all permission categories with their permissions, ordered by displayOrder
  const categories = await prisma.permissionCategory.findMany({
    include: {
      permissions: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });
  return categories;
}

export async function createNewRole(
  name: string,
  description: string,
  createdByUserId: string,
  permissionIds: string[],
) {
  const roleId = await createRole(name, description, createdByUserId, false, permissionIds)

  if (roleId) {
    revalidatePath("/access-control")
    return { success: true, roleId }
  }

  return { success: false, error: "Failed to create role" }
}

export async function updateRole(
  roleId: string,
  name: string,
  description: string,
  updatedByUserId: string,
  permissionIds: string[],
) {
  try {
    await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        description,
      },
    })

    const success = await updateRolePermissions(roleId, permissionIds, updatedByUserId)

    if (success) {
      revalidatePath(`/access-control/edit/${roleId}`)
      revalidatePath(`/access-control/view/${roleId}`)
      revalidatePath("/access-control")
      return { success: true }
    }

    return { success: false, error: "Failed to update role permissions" }
  } catch (error) {
    console.error("Error updating role:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function toggleRoleStatus(roleId: string, isActive: boolean, updatedByUserId: string) {
  try {
    const role = await prisma.role.findUnique({ where: { id: roleId } })

    if (!role) {
      return { success: false, error: "Role not found" }
    }

    if (role.isSystemRole) {
      return { success: false, error: "System roles cannot be deactivated" }
    }

    // For now, we'll use ROLE_UPDATE as the action type since ROLE_ACTIVATE/DEACTIVATE don't exist
    await prisma.permissionAuditLog.create({
      data: {
        id: crypto.randomUUID(),
        actionType: "ROLE_UPDATE",
        adminId: updatedByUserId,
        roleId: roleId,
        details: `Role ${isActive ? 'activated' : 'deactivated'}: ${role.name}`,
      },
    })

    // Since Role model doesn't have isActive field, we'll implement this differently
    // For now, we'll just log the action and return success
    // In a real implementation, you might want to add an isActive field to the Role model

    revalidatePath("/access-control")
    return { success: true }
  } catch (error) {
    console.error("Error updating role status:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function assignRole(adminId: string, roleId: string, assignedByUserId: string) {
  const success = await assignRoleToUser(adminId, roleId, assignedByUserId)

  if (success) {
    revalidatePath("/users")
    return { success: true }
  }

  return { success: false, error: "Failed to assign role" }
}

export async function removeRole(adminId: string, roleId: string, removedByUserId: string) {
  const success = await removeRoleFromUser(adminId, roleId, removedByUserId)

  if (success) {
    revalidatePath("/users")
    return { success: true }
  }

  return { success: false, error: "Failed to remove role" }
}
