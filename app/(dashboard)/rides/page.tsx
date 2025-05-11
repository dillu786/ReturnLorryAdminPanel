"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
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

  const fetchRides = async () => {
    try {
      const response = await fetch('/api/rides');
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched rides:", data);
      return data;
    } catch (error) {
      console.error("Error fetching rides:", error);
      throw error;
    }
  }

  const { data: rides = [], isLoading, error } = useQuery({
    queryKey: ["rides"],
    queryFn: fetchRides,
  });

  // Determine status badge variant
  const getStatusVariant = (status) => {
    if (!status) return "outline";
    
    const statusLower = status.toLowerCase();
    if (statusLower === "completed") return "default";
    if (statusLower === "in-progress") return "secondary";
    if (statusLower === "scheduled") return "outline";
    return "destructive";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "$0.00";
    return `${parseFloat(amount).toFixed(2)}`;
  };

  // Memoize action handlers
  const handleView = useCallback((rideId) => {
    // Handle view action
    console.log("View ride:", rideId);
  }, []);

  const handleEdit = useCallback((rideId) => {
    // Handle edit action
    console.log("Edit ride:", rideId);
  }, []);

  const handleDelete = useCallback((rideId) => {
    // Handle delete action
    console.log("Delete ride:", rideId);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    rides.map((ride, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium">{ride.User?.Name || "Unknown"}</TableCell>
        <TableCell className="hidden md:table-cell">{ride.Driver?.Name || "Unknown"}</TableCell>
        <TableCell className="hidden md:table-cell">{ride.Vehicle?.Model || "Unknown"}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant={getStatusVariant(ride.Status)}>
            {ride.Status || "Unknown"}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{formatDate(ride.CreatedDateTime)}</TableCell>
        <TableCell className="hidden md:table-cell">{formatCurrency(ride.Fare)}</TableCell>
        <TableCell className="hidden md:table-cell">{formatCurrency(ride.Distance)}</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(index)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.edit && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {permissions.delete && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
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
        {isLoading ? (
          <div className="py-12 text-center">Loading rides...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">Error loading rides</div>
        ) : (
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
                  <TableHead className="hidden md:table-cell">Distance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No rides found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}