"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

// Dummy roles and permissions for testing
const DUMMY_ROLES = {
  admin: [
    "dashboard:view",
    "rides:view",
    "users:view",
    "drivers:view",
    "owners:view",
    "settings:access_control",
    "documents:view",
  ],
  manager: [
    "dashboard:view",
    "rides:view",
    "users:view",
    "drivers:view",
    "owners:view",
  ],
  operator: [
    "dashboard:view",
    "rides:view",
  ],
}

export function usePermissions() {
  const { data: session } = useSession()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate loading permissions based on user role
    // In a real app, this would come from the session or API
    const userRole = session?.user?.role || "admin"
    setPermissions(DUMMY_ROLES[userRole as keyof typeof DUMMY_ROLES] || DUMMY_ROLES.admin)
  }, [session])

  const hasPermission = (permissionCode: string) => {
    return permissions.includes(permissionCode)
  }

  return { permissions, hasPermission, loading }
}
