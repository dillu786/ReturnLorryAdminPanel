"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { getUserPermissionsAction } from "@/app/actions/permission-actions"

export function usePermissions() {
  const { data: session, status } = useSession()
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionLoading = status === "loading"

  useEffect(() => {
    let mounted = true

    const fetchPermissions = async () => {
      if (!sessionLoading && session?.user?.id) {
        try {
          const result = await getUserPermissionsAction(session.user.id)
          if (mounted && result.success && result.permissions) {
            setLoading(false);
            setPermissions(result.permissions)
          }
        } catch (error) {
          console.error("Error fetching permissions:", error)
          if (mounted) {
            setPermissions([])
          }
        }
      }
    }

    fetchPermissions()

    return () => {
      mounted = false
    }
  }, [session?.user?.id, sessionLoading])

  const hasPermission = useCallback((permissionCode: string) => {
    return permissions.includes(permissionCode)
  }, [permissions])

  const value = useMemo(() => ({
    permissions,
    hasPermission,
    loading
  }), [permissions, hasPermission, loading])

  return value
}
