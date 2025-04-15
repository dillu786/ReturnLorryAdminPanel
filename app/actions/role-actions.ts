"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/db/prisma/prisma"
import { createRole, updateRolePermissions, assignRoleToUser, removeRoleFromUser } from "@/db/permisssions"

export async function getRoles() {
  return prisma.roles.findMany({
    include: {
      _count: {
        select: {
          role_permissions: true,
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
  return prisma.roles.findUnique({
    where: { id },
    include: {
      role_permissions: {
        include: {
          permissions: {
            include: {
              permission_categories: true,
            },
          },
        },
      },
      user_roles: {
        include: {
          admin_user_roles_adminIdToadmin: true,
        },
      },
    },
  })
}

export async function getAllPermissions() {
  return prisma.permission_categories.findMany({
    include: {
      permissions: true,
    },
    orderBy: [
      { displayOrder: "asc" },
      { name: "asc" },
    ],
  })
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
    await prisma.roles.update({
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

export async function deleteRole(roleId: string, deletedByUserId: string) {
  try {
    const role = await prisma.roles.findUnique({ where: { id: roleId } })

    if (role?.isSystemRole) {
      return { success: false, error: "System roles cannot be deleted" }
    }

    await prisma.permission_audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        actionType: "ROLE_DELETE",
        adminId: deletedByUserId,
        roleId: roleId,
        details: `Role deleted: ${role?.name}`,
      },
    })

    await prisma.roles.delete({
      where: { id: roleId },
    })

    revalidatePath("/access-control")
    return { success: true }
  } catch (error) {
    console.error("Error deleting role:", error)
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
