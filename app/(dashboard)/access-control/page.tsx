import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MoreHorizontal, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function AccessControlPage() {
  // Mock data for roles
  const roles = [
    {
      id: "1",
      name: "Super Admin",
      description: "Full access to all system features",
      users: 2,
      permissions: "All",
      created: "Jan 10, 2023",
    },
    {
      id: "2",
      name: "Admin",
      description: "Access to most system features except critical settings",
      users: 5,
      permissions: "Most",
      created: "Jan 15, 2023",
    },
    {
      id: "3",
      name: "Manager",
      description: "Can manage users, drivers, and view reports",
      users: 8,
      permissions: "Limited",
      created: "Feb 3, 2023",
    },
    {
      id: "4",
      name: "Support",
      description: "Can view and respond to user inquiries",
      users: 12,
      permissions: "Basic",
      created: "Mar 22, 2023",
    },
    {
      id: "5",
      name: "Viewer",
      description: "Read-only access to dashboards and reports",
      users: 20,
      permissions: "Read-only",
      created: "Apr 15, 2023",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
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
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{role.description}</TableCell>
                  <TableCell className="hidden md:table-cell">{role.users}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        role.permissions === "All"
                          ? "default"
                          : role.permissions === "Most"
                            ? "success"
                            : role.permissions === "Limited"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {role.permissions}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{role.created}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit role</DropdownMenuItem>
                        <DropdownMenuItem>Manage permissions</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete role</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
