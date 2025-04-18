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
import { toast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface PermissionCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  displayOrder: number
}

interface Permission {
  id: string
  name: string
  code: string
  description: string | null
  categoryId: string
  permission_categories: PermissionCategory
}

export default  function NewRolePage() {
  const router = useRouter()
  const session =  useSession();
  const currentUserId = session?.data?.user?.id;
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const permissionsData = await getAllPermissions()
        // Transform the permissions data to match our interface
        const typedPermissions = permissionsData.flatMap(category => 
          category.permissions.map(permission => ({
            id: permission.id,
            name: permission.name,
            code: permission.code,
            description: permission.description,
            categoryId: permission.categoryId,
            permission_categories: category
          }))
        )
        setPermissions(typedPermissions)
      } catch (error) {
        console.error("Error fetching permissions:", error)
        toast({
          title: "Error",
          description: "Failed to load permissions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  const handleSelectAllInCategory = (categoryPermissions: Permission[], checked: boolean) => {
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

  const isCategoryFullySelected = (categoryPermissions: Permission[]) => {
    return categoryPermissions.every((permission) => selectedPermissions.has(permission.id))
  }

  const isCategoryPartiallySelected = (categoryPermissions: Permission[]) => {
    const hasSelected = categoryPermissions.some((permission) => selectedPermissions.has(permission.id))
    return hasSelected && !isCategoryFullySelected(categoryPermissions)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      
      const result = await createNewRole(
        formData.name,
        formData.description,
        currentUserId as string,
        Array.from(selectedPermissions)
      )

      if (result.success) {
        toast({
          title: "Success",
          description: "Role created successfully",
        })
        router.push(`/access-control/view/${result.roleId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
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

  const permissionCategories = permissions.reduce((acc, permission) => {
    const category = permission.permission_categories
    if (!acc[category.name]) {
      acc[category.name] = {
        description: category.description || "",
        permissions: []
      }
    }
    acc[category.name].permissions.push(permission)
    return acc
  }, {} as Record<string, { description: string; permissions: Permission[] }>)

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
            <Tabs defaultValue={Object.keys(permissionCategories)[0] || "none"} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                {Object.keys(permissionCategories).map((categoryName) => (
                  <TabsTrigger key={categoryName} value={categoryName}>
                    {categoryName}
                  </TabsTrigger>
                ))}
                {Object.keys(permissionCategories).length === 0 && <TabsTrigger value="none">No Categories</TabsTrigger>}
              </TabsList>

              {Object.entries(permissionCategories).map(([categoryName, category]) => (
                <TabsContent key={categoryName} value={categoryName} className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`select-all-${categoryName}`}
                      checked={isCategoryFullySelected(category.permissions)}
                      onCheckedChange={(checked) => handleSelectAllInCategory(category.permissions, checked === true)}
                    />
                    <Label htmlFor={`select-all-${categoryName}`} className="font-medium">
                      Select All {categoryName} Permissions
                    </Label>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {category.permissions.map((permission) => (
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

              {Object.keys(permissionCategories).length === 0 && (
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
