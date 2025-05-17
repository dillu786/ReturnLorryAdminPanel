"use client"

import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2, Car, ChevronLeft, ChevronRight, X, FileText } from "lucide-react"
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
import { useDebounce } from "@/hooks/use-debounce"
import { OwnerDetailsModal } from "@/components/owner-details-modal"
import { useRouter } from "next/navigation"

interface Owner {
  Id: string
  Name: string
  Email: string
  MobileNumber: string
  status: string
  drivers: number
  joined: string
}

export default function OwnersPage() {
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;
  
  // Debounce search input to prevent too many API calls
  const debouncedSearch = useDebounce(search, 300);
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("owners:view"),
    edit: hasPermission("owners:edit"),
    delete: hasPermission("owners:delete"),
    create: hasPermission("owners:create"),
    export: hasPermission("owners:export"),
  }), [hasPermission]);

  const router = useRouter()

  const fetchOwners = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status && { status })
      });

      const response = await fetch(`/api/owners?${params}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching owners:", error);
      throw error;
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["owners", page, debouncedSearch, status],
    queryFn: fetchOwners
  });

  const owners = data?.owners || [];
  const pagination = data?.pagination || { total: 0, page: 1, pageSize, totalPages: 0 };

  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Memoize action handlers
  const handleView = useCallback((ownerId: string) => {
    router.push(`/owners/${ownerId}`)
  }, [router])

  const handleEdit = useCallback((ownerId: string) => {
    console.log("Edit owner:", ownerId);
  }, []);

  const handleDelete = useCallback((ownerId: string) => {
    console.log("Delete owner:", ownerId);
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

  const fetchOwnerDetails = async (ownerId: string) => {
    try {
      const response = await fetch(`/api/owners/${ownerId}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedOwner(data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching owner details:", error);
      // You might want to show a toast notification here
    }
  };

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    owners.map((owner: Owner) => (
      <TableRow key={owner.Id}>
        <TableCell className="font-medium">{owner.Name}</TableCell>
        <TableCell className="hidden md:table-cell">{owner.Email}</TableCell>
        <TableCell className="hidden md:table-cell">{owner.MobileNumber}</TableCell>
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
        <TableCell className="hidden md:table-cell">{owner.drivers}</TableCell>
        <TableCell className="hidden md:table-cell">{owner.joined}</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(owner.Id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => fetchOwnerDetails(owner.Id)}>
                <FileText className="h-4 w-4" />
                <span className="sr-only">Documents</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => fetchOwnerDetails(owner.Id)}>
                <Car className="h-4 w-4" />
                <span className="sr-only">Vehicles</span>
              </Button>
              {permissions.edit && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(owner.Id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {permissions.delete && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(owner.Id)}>
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
        <h2 className="text-3xl font-bold tracking-tight">Owners</h2>
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
              <Input 
                type="search" 
                placeholder="Search by name, email, phone..." 
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
                      Filter owners by status
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
          <div className="py-12 text-center">Loading owners...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">Error loading owners</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Drivers</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No owners found
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
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, pagination.total)} of {pagination.total} owners
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
      
      <OwnerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOwner(null);
        }}
        owner={selectedOwner}
      />
    </div>
  )
}
