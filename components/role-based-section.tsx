"use client"

import { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RoleBasedSectionProps {
  requiredPermission: string
  children: ReactNode
  title?: string
  description?: string
}

export function RoleBasedSection({
  requiredPermission,
  children,
  title,
  description,
}: RoleBasedSectionProps) {
  const { hasPermission, loading } = usePermissions()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || "Loading..."}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasPermission(requiredPermission)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || "Access Denied"}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this section. Please contact your administrator if you believe this is an error.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
} 