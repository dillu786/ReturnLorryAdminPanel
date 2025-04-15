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
import { getAllPermissions, createNewRole } from "@/app/actions/role-actions"

export default function NewRolePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
    async function fetchPermissions() {
      try {
        const permissions = await getAllPermissions()
        setAllPermissions(permissions)
      } catch (error) {
        console.error("Error fetching permissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

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

      const response = await createNewRole(
        formData.name,
        formData.description,
        currentUserId,
        Array.from(selectedPermissions),
      )

      if (response.success) {
        router.push(`/access-control/view/${response.roleId}`)
      } else {
        alert(response.error || "Failed to create role")
      }
    } catch (error) {
      console.error("Error creating role:", error)
      alert("An error occurred while creating the role")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading permissions...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/access-control">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Create New Role</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>Enter basic information about the role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this role"
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
            <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Role
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
