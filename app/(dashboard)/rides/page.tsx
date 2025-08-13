"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, ChevronLeft, ChevronRight, X, MapPin, Clock, DollarSign, User, Truck, CheckCircle, XCircle, Loader2 } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useCacheInvalidation } from "@/hooks/use-cache-invalidation"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function RidesPage() {
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [isRideDetailsOpen, setIsRideDetailsOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const pageSize = 10;
  
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
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await fetch(`/api/rides?${params}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching rides:", error);
      throw error;
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.RIDES, page, search, status],
    queryFn: fetchRides,
  });

  const rides = data?.rides || [];
  const pagination = data?.pagination || { total: 0, page: 1, pageSize, totalPages: 0 };

  // Cache invalidation and API helpers
  const { invalidateRideCache, apiCallWithCacheInvalidation } = useCacheInvalidation();

  // Fetch ride details when selected
  const { data: rideData, isLoading: isLoadingRide } = useQuery({
    queryKey: [CACHE_KEYS.RIDE, selectedRide?.Id],
    queryFn: async () => {
      if (!selectedRide) return null;
      const response = await fetch(`/api/rides/${selectedRide.Id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Ride not found");
        }
        throw new Error("Failed to fetch ride details");
      }
      return await response.json();
    },
    enabled: !!selectedRide,
  });

  // Determine status badge variant
  const getStatusVariant = (status: string) => {
    if (!status) return "outline";
    
    const statusLower = status.toLowerCase();
    if (statusLower === "completed") return "default";
    if (statusLower === "in-progress") return "secondary";
    if (statusLower === "scheduled") return "outline";
    return "destructive";
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return `₹${parseFloat(amount.toString()).toFixed(2)}`;
  };

  // Memoize action handlers
  const handleView = useCallback((ride: any) => {
    setSelectedRide(ride);
    setIsRideDetailsOpen(true);
  }, []);





  const handleRideStatusChange = useCallback(async (rideId: string, newStatus: string) => {
    setIsUpdating(rideId);
    
    try {
      const status = newStatus === 'complete' ? 'COMPLETED' : 'CANCELLED';
      const response = await fetch('/api/rides/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rideId: parseInt(rideId),
          status 
        })
      });
      
      if (response.ok) {
        // Invalidate cache
        invalidateRideCache(rideId);
        window.location.reload(); // Simple refresh for now
        
        toast({
          title: "Success",
          description: `Ride ${newStatus === 'complete' ? 'completed' : 'cancelled'} successfully!`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || `Failed to ${newStatus} ride`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast({
        title: "Error",
        description: `Failed to ${newStatus} ride`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  }, [invalidateRideCache]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on new search
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setPage(1);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    rides.map((ride) => (
      <TableRow key={ride.Id}>
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
        <TableCell className="hidden md:table-cell">{ride.Distance} Km</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(ride)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.edit && (
                <>
                  {ride.Status !== 'COMPLETED' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRideStatusChange(ride.Id, 'complete')}
                      title="Mark Complete"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="sr-only">Mark Complete</span>
                    </Button>
                  )}
                  {ride.Status !== 'CANCELLED' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRideStatusChange(ride.Id, 'cancel')}
                      title="Cancel Ride"
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Cancel Ride</span>
                    </Button>
                  )}
                </>
              )}

            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [rides, permissions, handleView]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rides</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search rides..." 
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
                      Filter rides by status
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Select value={status || 'all'} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                  <TableHead className="hidden md:table-cell">Amount (₹)</TableHead>
                  <TableHead className="hidden md:table-cell">Distance (Km)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No rides found
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
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, pagination.total)} of {pagination.total} rides
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

      {/* Ride Details Dialog */}
      <Dialog open={isRideDetailsOpen} onOpenChange={setIsRideDetailsOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] max-w-4xl max-h-[70vh] sm:max-h-[65vh] md:max-h-[60vh] overflow-hidden flex flex-col mx-auto mb-8 sm:mb-12 md:mb-16">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Ride Details #{rideData?.ride?.Id}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 pt-6">
            {isLoadingRide ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : rideData?.ride ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ride Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Ride ID</Label>
                      <p className="text-sm font-mono">#{rideData.ride.Id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant={getStatusVariant(rideData.ride.Status)}>
                        {rideData.ride.Status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="text-sm">{rideData.ride.createdAt}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                      <p className="text-sm">{rideData.ride.updatedAt}</p>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Route Details</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Pickup Location</Label>
                      <p className="text-sm">{rideData.ride.PickUpLocation}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Drop Location</Label>
                      <p className="text-sm">{rideData.ride.DropLocation}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Distance</Label>
                      <p className="text-sm">{rideData.ride.totalDistance} Km</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Estimated Duration</Label>
                      <p className="text-sm">{rideData.ride.estimatedDuration}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                {rideData.ride.User && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                        <p className="text-sm">{rideData.ride.User.Name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm">{rideData.ride.User.Email || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Mobile</Label>
                        <p className="text-sm">{rideData.ride.User.MobileNumber}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver Information */}
                {rideData.ride.Driver && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Driver</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                        <p className="text-sm">{rideData.ride.Driver.Name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm">{rideData.ride.Driver.Email || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Mobile</Label>
                        <p className="text-sm">{rideData.ride.Driver.MobileNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <Badge variant={rideData.ride.Driver.IsOnline ? 'default' : 'secondary'}>
                          {rideData.ride.Driver.IsOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vehicle Information */}
                {rideData.ride.Vehicle && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Vehicle</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                        <p className="text-sm">{rideData.ride.Vehicle.Model}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Number</Label>
                        <p className="text-sm">{rideData.ride.Vehicle.VehicleNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                        <p className="text-sm">{rideData.ride.Vehicle.VehicleType}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fare</Label>
                      <p className="text-2xl font-bold">{formatCurrency(rideData.ride.Fare)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Payment Mode</Label>
                      <p className="text-sm">{rideData.ride.PaymentMode}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No ride data available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>


    </div>
  )
}