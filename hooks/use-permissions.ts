"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { getUserPermissionsAction } from "@/app/actions/permission-actions"

export function usePermissions() {
  const { data: session, status } = useSession()
  const [permissions, setPermissions] = useState<string[]>([])
  const loading = status === "loading"

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!loading && session?.user?.id) {
        try {
          const result = await getUserPermissionsAction(session.user.id)
          if (result.success && result.permissions) {
            console.log("result.permissions", result.permissions);
            setPermissions(result.permissions)
          } else {
            console.error("Error fetching permissions:", result.error)
            setPermissions([])
          }
        } catch (error) {
          console.error("Error fetching permissions:", error)
          setPermissions([])
        }
      }
    }

    fetchPermissions()
  }, [session, loading])

  const hasPermission = (permissionCode: string) => {
    return permissions.includes(permissionCode)
  }

  return { permissions, hasPermission, loading }
}
