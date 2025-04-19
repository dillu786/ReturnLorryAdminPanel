"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2, Car } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback } from "react"

export default function RidesPage() {
  const { hasPermission } = usePermissions();
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("rides:view"),
    edit: hasPermission("rides:edit"),
    delete: hasPermission("rides:delete"),
    create: hasPermission("rides:create"),
    export: hasPermission("rides:export"),
  }), [hasPermission]);

  // Mock data for rides
  const rides = [
    {
      id: "1",
      customer: "John Smith",
      driver: "Michael Brown",
      vehicle: "Toyota Camry",
      status: "completed",
      date: "2024-02-15",
      amount: "$25.00",
    },
    {
      id: "2",
      customer: "Sarah Johnson",
      driver: "Emily Davis",
      vehicle: "Honda Civic",
      status: "in-progress",
      date: "2024-02-15",
      amount: "$18.50",
    },
    {
      id: "3",
      customer: "Robert Wilson",
      driver: "David Lee",
      vehicle: "Ford Focus",
      status: "cancelled",
      date: "2024-02-14",
      amount: "$0.00",
    },
    {
      id: "4",
      customer: "Emily Davis",
      driver: "John Smith",
      vehicle: "Hyundai Elantra",
      status: "completed",
      date: "2024-02-14",
      amount: "$32.75",
    },
    {
      id: "5",
      customer: "Michael Brown",
      driver: "Sarah Johnson",
      vehicle: "Nissan Altima",
      status: "scheduled",
      date: "2024-02-16",
      amount: "$0.00",
    },
  ]

  // Memoize action handlers
  const handleView = useCallback((rideId: string) => {
    // Handle view action
    console.log("View ride:", rideId);
  }, []);

  const handleEdit = useCallback((rideId: string) => {
    // Handle edit action
    console.log("Edit ride:", rideId);
  }, []);

  const handleDelete = useCallback((rideId: string) => {
    // Handle delete action
    console.log("Delete ride:", rideId);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    rides.map((ride) => (
      <TableRow key={ride.id}>
        <TableCell className="font-medium">{ride.customer}</TableCell>
        <TableCell className="hidden md:table-cell">{ride.driver}</TableCell>
        <TableCell className="hidden md:table-cell">{ride.vehicle}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant={
              ride.status === "completed"
                ? "default"
                : ride.status === "in-progress"
                ? "secondary"
                : ride.status === "scheduled"
                ? "outline"
                : "destructive"
            }
          >
            {ride.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{ride.date}</TableCell>
        <TableCell className="hidden md:table-cell">{ride.amount}</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(ride.id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.edit && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(ride.id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {permissions.delete && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(ride.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [rides, permissions, handleView, handleEdit, handleDelete]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rides</h2>
        {permissions.create && (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Ride
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search rides..." className="w-full pl-8" />
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
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Driver</TableHead>
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Amount</TableHead>
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
