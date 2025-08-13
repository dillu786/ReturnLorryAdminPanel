"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Power, PowerOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ToggleRoleStatusButtonProps {
  roleId: string
  roleName: string
  isActive: boolean
  onToggle: (roleId: string, newStatus: boolean) => Promise<void>
}

export function ToggleRoleStatusButton({ roleId, roleName, isActive, onToggle }: ToggleRoleStatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    if (confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} the role "${roleName}"?`)) {
      setIsUpdating(true)
      try {
        await onToggle(roleId, !isActive)
      } catch (error) {
        console.error("Error updating role status:", error)
        alert("An error occurred while updating the role status")
      } finally {
        setIsUpdating(false)
      }
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      title={`${isActive ? 'Deactivate' : 'Activate'} Role`} 
      onClick={handleToggle} 
      disabled={isUpdating}
    >
      {isActive ? (
        <PowerOff className="h-4 w-4 text-orange-500" />
      ) : (
        <Power className="h-4 w-4 text-green-500" />
      )}
      <span className="sr-only">{isActive ? 'Deactivate' : 'Activate'}</span>
    </Button>
  )
} 