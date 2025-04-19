"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback } from "react"

export default function DriversPage() {
  const { hasPermission } = usePermissions();
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("drivers:view"),
    edit: hasPermission("drivers:edit"),
    documents: hasPermission("drivers:documents"),
    suspend: hasPermission("drivers:suspend"),
    create: hasPermission("drivers:create"),
    export: hasPermission("drivers:export"),
  }), [hasPermission]);

  // Mock data for drivers
  const drivers = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 (555) 123-4567",
      status: "active",
      vehicle: "Toyota Camry",
      rating: 4.8,
      rides: 156,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1 (555) 987-6543",
      status: "active",
      vehicle: "Honda Civic",
      rating: 4.9,
      rides: 203,
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.b@example.com",
      phone: "+1 (555) 456-7890",
      status: "inactive",
      vehicle: "Ford Focus",
      rating: 4.5,
      rides: 89,
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+1 (555) 234-5678",
      status: "active",
      vehicle: "Hyundai Elantra",
      rating: 4.7,
      rides: 178,
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.w@example.com",
      phone: "+1 (555) 876-5432",
      status: "suspended",
      vehicle: "Nissan Altima",
      rating: 4.2,
      rides: 45,
    },
  ]

  // Memoize action handlers
  const handleView = useCallback((driverId: string) => {
    // Handle view action
    console.log("View driver:", driverId);
  }, []);

  const handleEdit = useCallback((driverId: string) => {
    // Handle edit action
    console.log("Edit driver:", driverId);
  }, []);

  const handleDocuments = useCallback((driverId: string) => {
    // Handle documents action
    console.log("View documents:", driverId);
  }, []);

  const handleSuspend = useCallback((driverId: string) => {
    // Handle suspend action
    console.log("Suspend driver:", driverId);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    drivers.map((driver) => (
      <TableRow key={driver.id}>
        <TableCell className="font-medium">{driver.name}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.email}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant={
              driver.status === "active"
                ? "default"
                : driver.status === "inactive"
                ? "secondary"
                : "destructive"
            }
          >
            {driver.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{driver.vehicle}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.rating}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.rides}</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(driver.id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.edit && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(driver.id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {permissions.documents && (
                <Button variant="ghost" size="icon" onClick={() => handleDocuments(driver.id)}>
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">Documents</span>
                </Button>
              )}
              {permissions.suspend && (
                <Button variant="ghost" size="icon" onClick={() => handleSuspend(driver.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Suspend</span>
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [drivers, permissions, handleView, handleEdit, handleDocuments, handleSuspend]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
        {permissions.create && (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search drivers..." className="w-full pl-8" />
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
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead className="hidden md:table-cell">Rating</TableHead>
                <TableHead className="hidden md:table-cell">Rides</TableHead>
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
