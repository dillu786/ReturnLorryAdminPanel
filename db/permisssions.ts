import prisma from "./prisma/prisma"

/**
 * Check if an admin has a specific permission
 */
export async function hasPermission(adminId: string, permissionCode: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: {
      roles: { // <-- likely correct, check your schema
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!admin) return false

  for (const userRole of admin.roles) {
    for (const rolePermission of userRole.role.permissions) {
      if (rolePermission.permission.code === permissionCode) {
        return true;
      }
    }
  }

  return false
}

/**
 * Get all permissions for an admin
 */
export async function getUserPermissions(adminId: string) {
  console.log("adminId",adminId);
  const rolesWithPermissions = await prisma.userRole.findMany({
    where: {
      adminId,
    },
    include: {
      role: { 
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          
        },
      },
    })
  

  const permissions: any[] = []
  for (const userRole of rolesWithPermissions) {
    for (const rp of userRole.role.permissions) {
      permissions.push(rp.permission)
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
  console.log("adminId",adminId);
  const permissions = await getUserPermissions(adminId)
  return permissions.map((p) => p.code)
}

/**
 * Assign a role to an admin
 */
export async function assignRoleToUser(adminId: string, roleId: string, assignedByUserId: string): Promise<boolean> {
  try {
    const existing = await prisma.userRole.findUnique({
      where: {
        adminId_roleId: {
          adminId,
          roleId,
        },
      },
    })

    if (!existing) {
      await prisma.userRole.create({
        data: {
          id: crypto.randomUUID(),
          adminId,
          roleId,
          assignedById: assignedByUserId,
        },
      })

      await prisma.permissionAuditLog.create({
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
    await prisma.userRole.delete({
      where: {
        adminId_roleId: {
          adminId,
          roleId,
        },
      },
    })

    await prisma.permissionAuditLog.create({
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
    const role = await prisma.role.create({
      data: {
        id: crypto.randomUUID(),
        name,
        description,
        isSystemRole,
        createdById: createdByUserId,
        updatedAt: new Date()
      },
    })

    if (permissionIds.length > 0) {
      await Promise.all(
        permissionIds.map((permissionId) =>
          prisma.rolePermission.create({
            data: {
              id: crypto.randomUUID(),
              roleId: role.id,
              permissionId,
            },
          }),
        ),
      )
    }

    await prisma.permissionAuditLog.create({
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
    const current = await prisma.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true },
    })

    const currentIds = current.map((p: { permissionId: string }) => p.permissionId);

    const toAdd = permissionIds.filter((id: string) => !currentIds.includes(id))
    const toRemove = currentIds.filter((id: string) => !permissionIds.includes(id))

    await Promise.all(
      toAdd.map((permissionId) =>
        prisma.rolePermission.create({
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
        prisma.rolePermission.delete({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId,
            },
          },
        }),
      ),
    )

    await prisma.permissionAuditLog.create({
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
