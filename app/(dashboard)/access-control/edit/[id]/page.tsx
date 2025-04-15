"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { getRole, getAllPermissions, updateRole } from "@/app/actions/role-actions"

export default function EditRolePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const roleId = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState<any>(null)
  const [allPermissions, setAllPermissions] = useState<any[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce(
    (acc, permission) => {
      const categoryName = permission.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = {
          ...permission.category,
          permissions: [],
        }
      }
      acc[categoryName].permissions.push(permission)
      return acc
    },
    {} as Record<string, any>,
  )

  // Sort categories by display order
  const sortedCategories = Object.values(permissionsByCategory).sort((a, b) => a.displayOrder - b.displayOrder)

  useEffect(() => {
    async function fetchData() {
      try {
        const [roleData, permissionsData] = await Promise.all([getRole(roleId), getAllPermissions()])

        if (!roleData) {
          router.push("/access-control")
          return
        }

        setRole(roleData)
        setFormData({
          name: roleData.name,
          description: roleData.description || "",
        })

        // Set selected permissions
        const selected = new Set<string>()
        roleData.permissions.forEach(({ permission }: any) => {
          selected.add(permission.id)
        })
        setSelectedPermissions(selected)

        setAllPermissions(permissionsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roleId, router])

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(permissionId)
      } else {
        newSet.delete(permissionId)
      }
      return newSet
    })
  }

  const handleSelectAllInCategory = (categoryPermissions: any[], checked: boolean) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev)

      categoryPermissions.forEach((permission) => {
        if (checked) {
          newSet.add(permission.id)
        } else {
          newSet.delete(permission.id)
        }
      })

      return newSet
    })
  }

  const isCategoryFullySelected = (categoryPermissions: any[]) => {
    return categoryPermissions.every((permission) => selectedPermissions.has(permission.id))
  }

  const isCategoryPartiallySelected = (categoryPermissions: any[]) => {
    const hasSelected = categoryPermissions.some((permission) => selectedPermissions.has(permission.id))
    return hasSelected && !isCategoryFullySelected(categoryPermissions)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Role name is required")
      return
    }

    setSaving(true)
    try {
      // In a real app, you would get the current user ID from the session
      const currentUserId = "current-user-id"

      const response = await updateRole(
        roleId,
        formData.name,
        formData.description,
        currentUserId,
        Array.from(selectedPermissions),
      )

      if (response.success) {
        router.push(`/access-control/view/${roleId}`)
      } else {
        alert(response.error || "Failed to update role")
      }
    } catch (error) {
      console.error("Error updating role:", error)
      alert("An error occurred while updating the role")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading role data...</p>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/access-control">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Role Not Found</h2>
        </div>
        <p>The requested role could not be found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/access-control/view/${roleId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Edit Role</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>Basic information about the role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={role.isSystemRole}
              />
              {role.isSystemRole && (
                <p className="text-sm text-muted-foreground">System role names cannot be changed.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Assign permissions to this role</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={sortedCategories[0]?.name || "none"} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                {sortedCategories.map((category) => (
                  <TabsTrigger key={category.name} value={category.name}>
                    {category.name}
                  </TabsTrigger>
                ))}
                {sortedCategories.length === 0 && <TabsTrigger value="none">No Categories</TabsTrigger>}
              </TabsList>

              {sortedCategories.map((category) => (
                <TabsContent key={category.name} value={category.name} className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`select-all-${category.name}`}
                      checked={isCategoryFullySelected(category.permissions)}
                      indeterminate={isCategoryPartiallySelected(category.permissions)}
                      onCheckedChange={(checked) => handleSelectAllInCategory(category.permissions, checked === true)}
                    />
                    <Label htmlFor={`select-all-${category.name}`} className="font-medium">
                      Select All {category.name} Permissions
                    </Label>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {category.permissions.map((permission: any) => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.has(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked === true)}
                          />
                          <div className="grid gap-1.5">
                            <Label htmlFor={permission.id} className="font-medium">
                              {permission.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}

              {sortedCategories.length === 0 && (
                <TabsContent value="none" className="pt-4">
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-muted-foreground">No permission categories found.</p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
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
    </div>
  )
}
