import { TableCell } from "@/components/ui/table"
import { TableBody } from "@/components/ui/table"
import { TableHead } from "@/components/ui/table"
import { TableRow } from "@/components/ui/table"
import { TableHeader } from "@/components/ui/table"
import { Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Users, Calendar, Shield } from "lucide-react"
import Link from "next/link"
import { getRole } from "@/app/actions/role-actions"
import { formatDistanceToNow } from "date-fns"

// Define types for the data structure
interface PermissionCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
  code: string;
  categoryId: string;
  permission_categories: PermissionCategory;
}

interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permissions: Permission;
}

interface Admin {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}

interface UserRole {
  id: string;
  assignedAt: string;
  adminId: string;
  roleId: string;
  assignedById: string | null;
  admin_user_roles_adminIdToadmin: Admin;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  role_permissions: RolePermission[];
  user_roles: UserRole[];
  admin?: Admin;
}

export default async function ViewRolePage({ params }: { params: { id: string } }) {
  const role = await getRole(params.id) as Role | null

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

  // Group permissions by category
  const permissionsByCategory = role.role_permissions.reduce(
    (acc, rolePermission) => {
      const categoryName = rolePermission.permissions.permission_categories.name
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(rolePermission)
      return acc
    },
    {} as Record<string, RolePermission[]>,
  )

  // Sort categories by display order
  const sortedCategories = Object.entries(permissionsByCategory).sort(([a], [b]) => {
    const categoryA = role.role_permissions.find((p) => p.permissions.permission_categories.name === a)?.permissions.permission_categories
    const categoryB = role.role_permissions.find((p) => p.permissions.permission_categories.name === b)?.permissions.permission_categories
    return (categoryA?.displayOrder || 0) - (categoryB?.displayOrder || 0)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/access-control">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{role.name}</h2>
          {role.isSystemRole && (
            <Badge variant="secondary" className="ml-2">
              System Role
            </Badge>
          )}
        </div>
        <Link href={`/access-control/edit/${params.id}`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Role
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">{role.description || "No description provided"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Users with this role</h3>
              <div className="mt-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{role.user_roles.length} users</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDistanceToNow(new Date(role.createdAt), { addSuffix: true })}</span>
              </div>
              {role.createdById && <p className="mt-1 text-sm text-muted-foreground">by {role.admin?.fullName || "Unknown"}</p>}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Permissions</h3>
              <div className="mt-1 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>{role.role_permissions.length} permissions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Permissions assigned to this role</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={sortedCategories[0]?.[0] || "none"} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4">
                {sortedCategories.map(([category]) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
                {sortedCategories.length === 0 && <TabsTrigger value="none">No Permissions</TabsTrigger>}
              </TabsList>

              {sortedCategories.map(([category, permissions]) => (
                <TabsContent key={category} value={category} className="space-y-4 pt-4">
                  <div className="border rounded-md p-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <div className="h-5 w-5 rounded-sm border bg-primary border-primary text-primary-foreground flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <div className="grid gap-1.5">
                            <p className="font-medium">{permission.permissions.name}</p>
                            <p className="text-sm text-muted-foreground">{permission.permissions.description}</p>
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
                    <p className="text-muted-foreground">This role has no permissions assigned.</p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {role.user_roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Users with this Role</CardTitle>
            <CardDescription>Users that have been assigned this role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.user_roles.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-medium">{userRole.admin_user_roles_adminIdToadmin.fullName}</TableCell>
                      <TableCell>{userRole.admin_user_roles_adminIdToadmin.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={userRole.admin_user_roles_adminIdToadmin.isActive ? "default" : "secondary"}>
                          {userRole.admin_user_roles_adminIdToadmin.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDistanceToNow(new Date(userRole.assignedAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
