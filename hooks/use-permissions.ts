"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const DUMMY_ROLES = {
  Admin: [
    "dashboard:view",
    "rides:view",
    "users:view",
    "drivers:view",
    "owners:view",
    "settings:access_control",
    "documents:view",
    "settings:view"
  ],
  Manager: [
    "dashboard:view",
    "rides:view",
    "users:view",
    "drivers:view",
    "owners:view",
  ],
  Support: [
    "dashboard:view",
    "rides:view",
  ],
}

export function usePermissions() {
  const { data: session, status } = useSession()
  const [permissions, setPermissions] = useState<string[]>([])
  const loading = status === "loading"

  useEffect(() => {
    if (!loading && session?.user?.role) {
      console.log("session"+session.user.role)
      const userRole = session.user.role as keyof typeof DUMMY_ROLES
      setPermissions(DUMMY_ROLES[userRole] || [])
    }
  }, [session, loading])

  const hasPermission = (permissionCode: string) => {
    return permissions.includes(permissionCode)
  }

  return { permissions, hasPermission, loading }
}
