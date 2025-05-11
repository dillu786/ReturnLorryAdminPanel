"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RoleBasedSection } from "@/components/role-based-section"
import { RoleBasedAction } from "@/components/role-based-action"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback } from "react"

export default function UsersPage() {
  const { hasPermission } = usePermissions();
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("users:view"),
    edit: hasPermission("users:edit"),
    delete: hasPermission("users:delete"),
    export: hasPermission("users:export"),
    create: hasPermission("users:create"),
  }), [hasPermission]);


  const fetchCustomers = async ()=>{
   
    const data = await fetch('/api/customers');
    const json =await data.json();
    console.log(json);
    return json;
  }
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers
  });
  // Mock data for users
  const customer = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      status: "active",
      rides: 42,
      joined: "Jan 15, 2023",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 (555) 987-6543",
      status: "active",
      rides: 28,
      joined: "Feb 3, 2023",
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "+1 (555) 456-7890",
      status: "inactive",
      rides: 15,
      joined: "Mar 22, 2023",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "+1 (555) 234-5678",
      status: "active",
      rides: 37,
      joined: "Apr 10, 2023",
    },
    {
      id: "5",
      name: "Michael Wilson",
      email: "michael.w@example.com",
      phone: "+1 (555) 876-5432",
      status: "blocked",
      rides: 8,
      joined: "May 5, 2023",
    },
  ]

  // Memoize action handlers
  const handleView = useCallback((userId: string) => {
    // Handle view action
    console.log("View user:", userId);
  }, []);

  const handleEdit = useCallback((userId: string) => {
    // Handle edit action
    console.log("Edit user:", userId);
  }, []);

  const handleDelete = useCallback((userId: string) => {
    // Handle delete action
    console.log("Delete user:", userId);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    customers.map((customer:any) => (
      <TableRow key={customer.Id}>
        <TableCell className="font-medium">{customer.Name}</TableCell>
        <TableCell className="hidden md:table-cell">{customer.Email}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant={
              customer.status === "active"
                ? "default"
                : customer.status === "inactive"
                ? "secondary"
                : "destructive"
            }
          >
            {customer.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{customer.rides}</TableCell>
        <TableCell className="hidden md:table-cell">{customer.joined}</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(customer.id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.edit && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(customer.id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {permissions.delete && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [customers, permissions, handleView, handleEdit, handleDelete]);

  return (
    
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          {permissions.create && (
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search users..." className="w-full pl-8" />
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
                  <TableHead className="hidden md:table-cell">Rides</TableHead>
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


