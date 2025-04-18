"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, MoreHorizontal, Filter, Eye, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { RoleBasedSection } from "@/components/role-based-section"
import { RoleBasedAction } from "@/components/role-based-action"

export default function OwnersPage() {
  // Mock data for owners
  const owners = [
    {
      id: "1",
      name: "Robert Smith",
      email: "robert.s@example.com",
      phone: "+1 (555) 234-5678",
      status: "active",
      vehicles: 3,
      joined: "Mar 10, 2023",
    },
    {
      id: "2",
      name: "Patricia Johnson",
      email: "patricia.j@example.com",
      phone: "+1 (555) 876-5432",
      status: "active",
      vehicles: 5,
      joined: "Jan 15, 2023",
    },
    {
      id: "3",
      name: "Thomas Wilson",
      email: "thomas.w@example.com",
      phone: "+1 (555) 345-6789",
      status: "inactive",
      vehicles: 2,
      joined: "Apr 22, 2023",
    },
    {
      id: "4",
      name: "Elizabeth Brown",
      email: "elizabeth.b@example.com",
      phone: "+1 (555) 987-6543",
      status: "active",
      vehicles: 4,
      joined: "Feb 8, 2023",
    },
    {
      id: "5",
      name: "James Davis",
      email: "james.d@example.com",
      phone: "+1 (555) 123-4567",
      status: "suspended",
      vehicles: 1,
      joined: "May 30, 2023",
    },
  ]

  return (
    <RoleBasedSection 
      requiredPermission="owners:view"
      title="Vehicle Owners"
      description="Manage vehicle owner accounts and permissions"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Vehicle Owners</h2>
          <RoleBasedAction requiredPermission="owners:create">
            <Plus className="mr-2 h-4 w-4" />
            Add Owner
          </RoleBasedAction>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search owners..." className="w-full pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
            <RoleBasedAction requiredPermission="owners:export" variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </RoleBasedAction>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicles</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">{owner.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{owner.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={
                          owner.status === "active"
                            ? "default"
                            : owner.status === "inactive"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {owner.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{owner.vehicles}</TableCell>
                    <TableCell className="hidden md:table-cell">{owner.joined}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <RoleBasedAction requiredPermission="owners:view" variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="owners:edit" variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="owners:delete" variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </RoleBasedAction>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </RoleBasedSection>
  )
}
