import prisma from "./prisma/prisma"

/**
 * Check if an admin has a specific permission
 */
export async function hasPermission(adminId: string, permissionCode: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: {
      user_roles_user_roles_adminIdToadmin: {
        include: {
          roles: {
            include: {
              role_permissions: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!admin) return false

  for (const userRole of admin.user_roles_user_roles_adminIdToadmin) {
    for (const rolePermission of userRole.roles.role_permissions) {
      if (rolePermission.permissions.code === permissionCode) {
        return true
      }
    }
  }

  return false
}

/**
 * Get all permissions for an admin
 */
export async function getUserPermissions(adminId: string) {
  const rolesWithPermissions = await prisma.user_roles.findMany({
    where: {
      adminId,
    },
    include: {
      roles: {
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
        },
      },
    },
  })

  const permissions: any[] = []
  for (const userRole of rolesWithPermissions) {
    for (const rp of userRole.roles.role_permissions) {
      permissions.push(rp.permissions)
    }
  }

  // Deduplicate based on permission ID
  const unique = new Map()
  for (const p of permissions) {
    unique.set(p.id, p)
  }

  return Array.from(unique.values()).sort((a, b) => {
    const aOrder = a.permission_categories?.displayOrder ?? 0
    const bOrder = b.permission_categories?.displayOrder ?? 0
    if (aOrder === bOrder) return a.name.localeCompare(b.name)
    return aOrder - bOrder
  })
}

/**
 * Get all permission codes for an admin
 */
export async function getUserPermissionCodes(adminId: string): Promise<string[]> {
  const permissions = await getUserPermissions(adminId)
  return permissions.map((p) => p.code)
}

/**
 * Assign a role to an admin
 */
export async function assignRoleToUser(adminId: string, roleId: string, assignedByUserId: string): Promise<boolean> {
  try {
    const existing = await prisma.user_roles.findUnique({
      where: {
        adminId_roleId: {
          adminId,
          roleId,
        },
      },
    })

    if (!existing) {
      await prisma.user_roles.create({
        data: {
          id: crypto.randomUUID(),
          adminId,
          roleId,
          assignedById: assignedByUserId,
        },
      })

      await prisma.permission_audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          actionType: "GRANT",
          adminId: assignedByUserId,
          roleId,
          details: `Role assigned to admin ID: ${adminId}`,
        },
      })
    }

    return true
  } catch (error) {
    console.error("Error assigning role:", error)
    return false
  }
}

/**
 * Remove a role from an admin
 */
export async function removeRoleFromUser(adminId: string, roleId: string, removedByUserId: string): Promise<boolean> {
  try {
    await prisma.user_roles.delete({
      where: {
        adminId_roleId: {
          adminId,
          roleId,
        },
      },
    })

    await prisma.permission_audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        actionType: "REVOKE",
        adminId: removedByUserId,
        roleId,
        details: `Role removed from admin ID: ${adminId}`,
      },
    })

    return true
  } catch (error) {
    console.error("Error removing role:", error)
    return false
  }
}

/**
 * Create a new role with permissions
 */
export async function createRole(
  name: string,
  description: string,
  createdByUserId: string,
  isSystemRole = false,
  permissionIds: string[] = [],
): Promise<string | null> {
  try {
    const role = await prisma.roles.create({
      data: {
        id: crypto.randomUUID(),
        name,
        description,
        isSystemRole,
        createdById: createdByUserId,
        updatedAt: Date.now() as unknown as any
      },
    })

    if (permissionIds.length > 0) {
      await Promise.all(
        permissionIds.map((permissionId) =>
          prisma.role_permissions.create({
            data: {
              id: crypto.randomUUID(),
              roleId: role.id,
              permissionId,
            },
          }),
        ),
      )
    }

    await prisma.permission_audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        actionType: "ROLE_CREATE",
        adminId: createdByUserId,
        roleId: role.id,
        details: `New role created: ${name}`,
      },
    })

    return role.id
  } catch (error) {
    console.error("Error creating role:", error)
    return null
  }
}

/**
 * Update a role's permissions
 */
export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[],
  updatedByUserId: string,
): Promise<boolean> {
  try {
    const current = await prisma.role_permissions.findMany({
      where: { roleId },
      select: { permissionId: true },
    })

    const currentIds = current.map((p) => p.permissionId)

    const toAdd = permissionIds.filter((id) => !currentIds.includes(id))
    const toRemove = currentIds.filter((id) => !permissionIds.includes(id))

    await Promise.all(
      toAdd.map((permissionId) =>
        prisma.role_permissions.create({
          data: {
            id: crypto.randomUUID(),
            roleId,
            permissionId,
          },
        }),
      ),
    )

    await Promise.all(
      toRemove.map((permissionId) =>
        prisma.role_permissions.delete({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId,
            },
          },
        }),
      ),
    )

    await prisma.permission_audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        actionType: "ROLE_UPDATE",
        adminId: updatedByUserId,
        roleId,
        details: `Role updated: ${toAdd.length} added, ${toRemove.length} removed`,
      },
    })

    return true
  } catch (error) {
    console.error("Error updating permissions:", error)
    return false
  }
}
