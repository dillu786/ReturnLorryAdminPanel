"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Power, PowerOff, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface StatusToggleButtonProps {
  entityId: number | string
  entityName: string
  entityType: 'driver' | 'user' | 'owner' | 'role'
  isActive: boolean
  onToggle: (entityId: number | string, isActive: boolean) => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function StatusToggleButton({
  entityId,
  entityName,
  entityType,
  isActive,
  onToggle,
  disabled = false,
  size = "icon",
  variant = "ghost"
}: StatusToggleButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleToggleClick = () => {
    setDialogOpen(true)
  }

  const handleToggleConfirm = async () => {
    setIsUpdating(true)
    setDialogOpen(false)

    try {
      const result = await onToggle(entityId, !isActive)
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} ${!isActive ? 'activated' : 'deactivated'} successfully!`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${!isActive ? 'activate' : 'deactivate'} ${entityType}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast({
        title: "Error",
        description: `Failed to ${!isActive ? 'activate' : 'deactivate'} ${entityType}`,
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getEntityTypeDisplay = () => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1)
  }

  const getActionText = () => {
    return isActive ? 'deactivate' : 'activate'
  }

  const getWarningText = () => {
    if (isActive) {
      switch (entityType) {
        case 'driver':
          return "This will prevent the driver from accessing the platform and accepting new rides."
        case 'user':
          return "This will prevent the user from accessing the platform and booking rides."
        case 'owner':
          return "This will prevent the owner from accessing the platform and managing vehicles."
        case 'role':
          return "This will prevent users with this role from accessing associated permissions."
        default:
          return "This will prevent access to the platform."
      }
    } else {
      switch (entityType) {
        case 'driver':
          return "This will allow the driver to access the platform and accept rides."
        case 'user':
          return "This will allow the user to access the platform and book rides."
        case 'owner':
          return "This will allow the owner to access the platform and manage vehicles."
        case 'role':
          return "This will allow users with this role to access associated permissions."
        default:
          return "This will allow access to the platform."
      }
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleToggleClick}
        disabled={disabled || isUpdating}
        title={`${getActionText().charAt(0).toUpperCase() + getActionText().slice(1)} ${getEntityTypeDisplay()}`}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isActive ? (
          <PowerOff className="h-4 w-4 text-orange-500" />
        ) : (
          <Power className="h-4 w-4 text-green-500" />
        )}
        <span className="sr-only">{getActionText().charAt(0).toUpperCase() + getActionText().slice(1)}</span>
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getActionText().charAt(0).toUpperCase() + getActionText().slice(1)} {getEntityTypeDisplay()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {getActionText()} the {entityType}{" "}
              <span className="font-semibold">{entityName}</span>?
              <span className={`block mt-2 text-sm ${isActive ? 'text-orange-600' : 'text-green-600'}`}>
                {getWarningText()}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleConfirm}
              className={isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
            >
              {getActionText().charAt(0).toUpperCase() + getActionText().slice(1)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 