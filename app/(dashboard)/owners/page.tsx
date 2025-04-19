"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2, Car } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback } from "react"

export default function OwnersPage() {
  const { hasPermission } = usePermissions();
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("owners:view"),
    edit: hasPermission("owners:edit"),
    delete: hasPermission("owners:delete"),
    create: hasPermission("owners:create"),
    export: hasPermission("owners:export"),
  }), [hasPermission]);

  // Mock data for owners
  const owners = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 (555) 123-4567",
      status: "active",
      vehicles: 3,
      joined: "Jan 15, 2023",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1 (555) 987-6543",
      status: "active",
      vehicles: 2,
      joined: "Feb 3, 2023",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.b@example.com",
      phone: "+1 (555) 456-7890",
      status: "inactive",
      vehicles: 1,
      joined: "Mar 22, 2023",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+1 (555) 234-5678",
      status: "active",
      vehicles: 4,
      joined: "Apr 10, 2023",
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.w@example.com",
      phone: "+1 (555) 876-5432",
      status: "blocked",
      vehicles: 0,
      joined: "May 5, 2023",
    },
  ]

  // Memoize action handlers
  const handleView = useCallback((ownerId: string) => {
    // Handle view action
    console.log("View owner:", ownerId);
  }, []);

  const handleEdit = useCallback((ownerId: string) => {
    // Handle edit action
    console.log("Edit owner:", ownerId);
  }, []);

  const handleDelete = useCallback((ownerId: string) => {
    // Handle delete action
    console.log("Delete owner:", ownerId);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    owners.map((owner) => (
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
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(owner.id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.edit && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(owner.id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {permissions.delete && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(owner.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [owners, permissions, handleView, handleEdit, handleDelete]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vehicle Owners</h2>
        {permissions.create && (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Owner
          </Button>
        )}
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
          {permissions.export && (
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
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
              {tableRows}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
