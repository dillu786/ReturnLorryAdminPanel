"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function UsersPage() {
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("users:view"),
    edit: hasPermission("users:edit"),
    delete: hasPermission("users:delete"),
    export: hasPermission("users:export"),
    create: hasPermission("users:create"),
  }), [hasPermission]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, search, status],
    queryFn: fetchUsers
  });

  const users = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, pageSize, totalPages: 0 };

  // Memoize action handlers
  const handleView = useCallback((userId: string) => {
    console.log("View user:", userId);
  }, []);

  const handleEdit = useCallback((userId: string) => {
    console.log("Edit user:", userId);
  }, []);

  const handleDelete = useCallback((userId: string) => {
    console.log("Delete user:", userId);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on new search
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setPage(1);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    users.map((user) => (
      <TableRow key={user.Id}>
        <TableCell className="font-medium">{user.Name}</TableCell>
        <TableCell className="hidden md:table-cell">{user.Email}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant={
              user.status === "active"
                ? "default"
                : user.status === "inactive"
                ? "secondary"
                : "destructive"
            }
          >
            {user.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{user.rides}</TableCell>
        <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(user.Id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.edit && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(user.Id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {permissions.delete && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(user.Id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [users, permissions, handleView, handleEdit, handleDelete]);

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
              <Input 
                type="search" 
                placeholder="Search users..." 
                className="w-full pl-8"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filters</h4>
                    <p className="text-sm text-muted-foreground">
                      Filter users by status
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(search || status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {permissions.export && (
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="py-12 text-center">Loading users...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">Error loading users</div>
        ) : (
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
                {users.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, pagination.total)} of {pagination.total} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


