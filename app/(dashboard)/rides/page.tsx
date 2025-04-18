"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, MoreHorizontal, Filter, MapPin, Eye, Edit, Trash2, Phone } from "lucide-react"
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

export default function RidesPage() {
  // Mock data for rides
  const rides = [
    {
      id: "R-1234",
      customer: "John Doe",
      driver: "Alex Johnson",
      pickup: "123 Main St, New York",
      dropoff: "456 Park Ave, New York",
      date: "Today, 10:30 AM",
      status: "completed",
      amount: "$24.50",
    },
    {
      id: "R-1235",
      customer: "Jane Smith",
      driver: "Sarah Williams",
      pickup: "789 Broadway, New York",
      dropoff: "101 5th Ave, New York",
      date: "Today, 11:15 AM",
      status: "in-progress",
      amount: "$18.75",
    },
    {
      id: "R-1236",
      customer: "Robert Johnson",
      driver: "Michael Brown",
      pickup: "222 West St, New York",
      dropoff: "333 East St, New York",
      date: "Today, 12:00 PM",
      status: "scheduled",
      amount: "$32.00",
    },
    {
      id: "R-1237",
      customer: "Emily Davis",
      driver: "Jessica Davis",
      pickup: "444 North Ave, New York",
      dropoff: "555 South Blvd, New York",
      date: "Today, 1:30 PM",
      status: "cancelled",
      amount: "$0.00",
    },
    {
      id: "R-1238",
      customer: "Michael Wilson",
      driver: "David Wilson",
      pickup: "666 Lexington Ave, New York",
      dropoff: "777 Madison Ave, New York",
      date: "Today, 2:45 PM",
      status: "scheduled",
      amount: "$27.25",
    },
  ]

  return (
    <RoleBasedSection 
      requiredPermission="rides:view"
      title="Rides"
      description="Manage and track all rides in the system"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Rides</h2>
          <RoleBasedAction requiredPermission="rides:create">
            <Plus className="mr-2 h-4 w-4" />
            Add Ride
          </RoleBasedAction>
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
            <RoleBasedAction requiredPermission="rides:export" variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </RoleBasedAction>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Driver</TableHead>
                  <TableHead className="hidden md:table-cell">Pickup/Dropoff</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.map((ride) => (
                  <TableRow key={ride.id}>
                    <TableCell className="font-medium">{ride.id}</TableCell>
                    <TableCell>{ride.customer}</TableCell>
                    <TableCell className="hidden md:table-cell">{ride.driver}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-xs">
                          <MapPin className="mr-1 h-3 w-3 text-green-500" />
                          {ride.pickup}
                        </div>
                        <div className="flex items-center text-xs">
                          <MapPin className="mr-1 h-3 w-3 text-red-500" />
                          {ride.dropoff}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{ride.date}</TableCell>
                    <TableCell>
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
                    <TableCell className="hidden md:table-cell">{ride.amount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <RoleBasedAction requiredPermission="rides:view" variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="rides:edit" variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="rides:cancel" variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
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
