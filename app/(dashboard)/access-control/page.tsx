import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getRoles } from "@/app/actions/role-actions"
import { DeleteRoleButton } from "@/components/delete-role-button"

export default async function AccessControlPage() {
  const roles = await getRoles()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>
        <Link href="/access-control/new-role">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search roles..." className="w-full pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden md:table-cell">Users</TableHead>
                <TableHead className="hidden md:table-cell">Permissions</TableHead>
                <TableHead className="hidden md:table-cell">System Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role: {
                id: string;
                name: string;
                description: string;
                _count: {
                  users: number;
                  permissions: number;
                };
                isSystemRole: boolean;
              }) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{role.description}</TableCell>
                  <TableCell className="hidden md:table-cell">{role._count.users}</TableCell>
                  <TableCell className="hidden md:table-cell">{role._count.permissions}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {role.isSystemRole ? (
                      <Badge variant="secondary">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/access-control/view/${role.id}`}>
                        <Button variant="ghost" size="icon" title="View Role">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                      <Link href={`/access-control/edit/${role.id}`}>
                        <Button variant="ghost" size="icon" title="Edit Role">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      {!role.isSystemRole && <DeleteRoleButton roleId={role.id} roleName={role.name} />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
