"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, User } from "lucide-react"
import Link from "next/link"
import { getRoles, assignRole, removeRole } from "@/app/actions/role-actions"

// This would typically be a server component that fetches the user
// and their roles, but for simplicity we're doing it client-side
export default function UserPermissionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const userId = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [userRoles, setUserRoles] = useState<Set<string>>(new Set())
  const [originalRoles, setOriginalRoles] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchData() {
      try {
        // In a real app, these would be separate API calls
        const [userData, rolesData] = await Promise.all([
          // Fetch user with their roles
          fetch(`/api/users/${userId}`).then((res) => res.json()),
          // Fetch all roles
          getRoles(),
        ])

        if (!userData || userData.error) {
          router.push("/users")
          return
        }

        setUser(userData)
        setRoles(rolesData)

        // Set user roles
        const userRoleIds = new Set(userData.roles.map((r: any) => r.roleId))
        setUserRoles(userRoleIds)
        setOriginalRoles(new Set(userRoleIds))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, router])

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setUserRoles((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(roleId)
      } else {
        newSet.delete(roleId)
      }
      return newSet
    })
  }

  const hasChanges = () => {
    if (userRoles.size !== originalRoles.size) return true

    for (const roleId of userRoles) {
      if (!originalRoles.has(roleId)) return true
    }

    for (const roleId of originalRoles) {
      if (!userRoles.has(roleId)) return true
    }

    return false
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, you would get the current user ID from the session
      const currentUserId = "current-user-id"

      // Roles to add
      const rolesToAdd = Array.from(userRoles).filter((roleId) => !originalRoles.has(roleId))

      // Roles to remove
      const rolesToRemove = Array.from(originalRoles).filter((roleId) => !userRoles.has(roleId))

      // Process role changes
      const promises = [
        ...rolesToAdd.map((roleId) => assignRole(userId, roleId, currentUserId)),
        ...rolesToRemove.map((roleId) => removeRole(userId, roleId, currentUserId)),
      ]

      await Promise.all(promises)

      // Update original roles to match current selection
      setOriginalRoles(new Set(userRoles))

      alert("User permissions updated successfully")
    } catch (error) {
      console.error("Error updating user permissions:", error)
      alert("An error occurred while updating user permissions")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading user data...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">User Not Found</h2>
        </div>
        <p>The requested user could not be found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/users/${userId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">User Permissions</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Basic information about the user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{user.fullName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Roles</CardTitle>
          <CardDescription>Manage the roles assigned to this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {roles.map((role) => (
              <div key={role.id} className="flex items-start space-x-2 border rounded-md p-4">
                <Checkbox
                  id={role.id}
                  checked={userRoles.has(role.id)}
                  onCheckedChange={(checked) => handleRoleChange(role.id, checked === true)}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor={role.id} className="font-medium">
                    {role.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {role._count.permissions} permissions
                    </span>
                    {role.isSystemRole && (
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                        System Role
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {roles.length === 0 && (
              <div className="col-span-full border rounded-md p-4 text-center">
                <p className="text-muted-foreground">No roles found.</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || !hasChanges()}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
