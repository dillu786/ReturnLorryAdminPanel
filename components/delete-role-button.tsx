"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { deleteRole } from "@/app/actions/role-actions"

interface DeleteRoleButtonProps {
  roleId: string
  roleName: string
}

export function DeleteRoleButton({ roleId, roleName }: DeleteRoleButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      setIsDeleting(true)
      try {
        // In a real app, you would get the current user ID from the session
        const currentUserId = "current-user-id"
        const response = await deleteRole(roleId, currentUserId)

        if (!response.success) {
          alert(response.error || "Failed to delete role")
        }
      } catch (error) {
        console.error("Error deleting role:", error)
        alert("An error occurred while deleting the role")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Button variant="ghost" size="icon" title="Delete Role" onClick={handleDelete} disabled={isDeleting}>
      <Trash className="h-4 w-4 text-destructive" />
      <span className="sr-only">Delete</span>
    </Button>
  )
} 