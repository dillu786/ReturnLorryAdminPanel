"use client"

import { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

interface RoleBasedActionProps {
  requiredPermission: string
  children: ReactNode
  tooltip?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  onClick?: () => void
}

export function RoleBasedAction({
  requiredPermission,
  children,
  tooltip = "You don't have permission to perform this action",
  variant = "default",
  size = "default",
  disabled = false,
  onClick,
}: RoleBasedActionProps) {
  const { hasPermission, loading } = usePermissions()

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled>
        {children}
      </Button>
    )
  }

  if (!hasPermission(requiredPermission)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={variant} size={size} disabled className="opacity-50">
              {children}
              <Lock className="ml-2 h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button variant={variant} size={size} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
} 