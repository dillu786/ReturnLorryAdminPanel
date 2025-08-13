"use client"

import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Car, ChevronLeft, ChevronRight, X, FileText, Power, PowerOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback, useState } from "react"
import { CACHE_KEYS } from "@/lib/cache-utils"
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebounce } from "@/hooks/use-debounce"
import { OwnerDetailsModal } from "@/components/owner-details-modal"
import { useRouter } from "next/navigation"
import { tree } from "next/dist/build/templates/app-page"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useCacheInvalidation } from "@/hooks/use-cache-invalidation"
import { StatusToggleButton } from "@/components/ui/status-toggle-button"
import { useStatusToggle } from "@/hooks/use-status-toggle"

interface Owner {
  Id: string
  Name: string
  Email: string
  MobileNumber: string
  IsActive: boolean
  drivers: number
  joined: string
}

export default function OwnersPage() {
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [driversCount, setDriversCount] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const pageSize = 8;
  
  const queryClient = useQueryClient();
  const { invalidateOwnerCache, apiCallWithCacheInvalidation } = useCacheInvalidation();
  
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
        ...(status && { status }),
        ...(driversCount && { driversCount }),
        ...(joinedDate && { joinedDate })
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
    queryKey: [CACHE_KEYS.OWNERS, page, debouncedSearch, status, driversCount, joinedDate],
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

  // Use the universal status toggle hook
  const { toggleStatus: toggleOwnerStatus } = useStatusToggle({
    entityType: 'owner',
    cacheKey: CACHE_KEYS.OWNERS,
    apiEndpoint: '/api/owners/toggle-status'
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on new search
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const handleDriversCountChange = useCallback((value: string) => {
    setDriversCount(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const handleJoinedDateChange = useCallback((value: string) => {
    setJoinedDate(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setDriversCount("");
    setJoinedDate("");
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
      toast({
        title: "Error",
        description: "Failed to fetch owner details",
        variant: "destructive"
      });
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
              owner.IsActive === true
                ? "default"
                : "secondary"
            }
          >
            {owner.IsActive === true ? "Active" : "Inactive"}
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Power className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleView(owner.Id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {permissions.edit && (
                <StatusToggleButton
                  entityId={owner.Id}
                  entityName={owner.Name}
                  entityType="owner"
                  isActive={owner.IsActive}
                  onToggle={toggleOwnerStatus}
                />
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [owners, permissions, handleView, toggleOwnerStatus]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Owners</h2>
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
                      Filter owners by various criteria
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Account Status</Label>
                      <Select value={status || 'all'} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Owners</SelectItem>
                          <SelectItem value="active">Active Owners</SelectItem>
                          <SelectItem value="inactive">Inactive Owners</SelectItem>
                          <SelectItem value="suspended">Suspended Owners</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Number of Drivers</Label>
                      <Select value={driversCount || 'all'} onValueChange={handleDriversCountChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select drivers count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Owners</SelectItem>
                          <SelectItem value="none">No Drivers (0)</SelectItem>
                          <SelectItem value="low">Few Drivers (1-5)</SelectItem>
                          <SelectItem value="medium">Some Drivers (6-15)</SelectItem>
                          <SelectItem value="high">Many Drivers (16+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Join Period</Label>
                      <Select value={joinedDate || 'all'} onValueChange={handleJoinedDateChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select join period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">This Quarter</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(search || status || driversCount || joinedDate) && (
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
                      {search || status || driversCount || joinedDate ? 'No owners found matching your criteria' : 'No owners found'}
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
