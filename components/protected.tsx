"use client"

import type { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"

interface ProtectedProps {
  requiredPermission?: string
  requiredPermissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function Protected({
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallback = null,
  children,
}: ProtectedProps) {
  const { hasPermission, loading } = usePermissions()

  // Still loading permissions
  if (loading) {
    return null
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    if (requireAll) {
      // User must have ALL specified permissions
      const hasAllPermissions = requiredPermissions.every((permission) => hasPermission(permission))
      if (!hasAllPermissions) {
        return <>{fallback}</>
      }
    } else {
      // User must have AT LEAST ONE of the specified permissions
      const hasAnyPermission = requiredPermissions.some((permission) => hasPermission(permission))
      if (!hasAnyPermission) {
        return <>{fallback}</>
      }
    }
  }

  // User has the required permissions
  return <>{children}</>
}
