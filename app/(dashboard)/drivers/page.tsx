"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, MoreHorizontal, Filter, Eye, Edit, Trash2, FileText } from "lucide-react"
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

export default function DriversPage() {
  // Mock data for drivers
  const drivers = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex.j@example.com",
      phone: "+1 (555) 123-4567",
      status: "active",
      vehicle: "Toyota Camry",
      rating: 4.8,
      rides: 156,
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      phone: "+1 (555) 987-6543",
      status: "active",
      vehicle: "Honda Civic",
      rating: 4.6,
      rides: 98,
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.b@example.com",
      phone: "+1 (555) 456-7890",
      status: "inactive",
      vehicle: "Ford Focus",
      rating: 4.2,
      rides: 67,
    },
    {
      id: "4",
      name: "Jessica Davis",
      email: "jessica.d@example.com",
      phone: "+1 (555) 234-5678",
      status: "active",
      vehicle: "Hyundai Sonata",
      rating: 4.9,
      rides: 203,
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.w@example.com",
      phone: "+1 (555) 876-5432",
      status: "suspended",
      vehicle: "Chevrolet Malibu",
      rating: 3.7,
      rides: 42,
    },
  ]

  return (
    <RoleBasedSection 
      requiredPermission="drivers:view"
      title="Drivers"
      description="Manage and track all drivers in the system"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
          <RoleBasedAction requiredPermission="drivers:create">
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </RoleBasedAction>
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
            <RoleBasedAction requiredPermission="drivers:export" variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </RoleBasedAction>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="hidden md:table-cell">Rides</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{driver.vehicle}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{driver.vehicle}</TableCell>
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
                    <TableCell className="hidden md:table-cell">{driver.rating}</TableCell>
                    <TableCell className="hidden md:table-cell">{driver.rides}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <RoleBasedAction requiredPermission="drivers:view" variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="drivers:edit" variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="drivers:documents" variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Documents</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="drivers:suspend" variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Suspend</span>
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
