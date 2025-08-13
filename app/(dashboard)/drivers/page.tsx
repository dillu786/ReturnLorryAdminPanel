"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCacheManager, CACHE_KEYS } from "@/lib/cache-utils"
import { useCacheInvalidation } from "@/hooks/use-cache-invalidation"
import { Label } from "@/components/ui/label"
import { StatusToggleButton } from "@/components/ui/status-toggle-button"
import { useStatusToggle } from "@/hooks/use-status-toggle"
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

export default function DriversPage() {
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [onlineStatus, setOnlineStatus] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 8;
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [verifyingDocuments, setVerifyingDocuments] = useState<Set<string>>(new Set());
  const { toggleStatus } = useStatusToggle({
    entityType: 'driver',
    cacheKey: CACHE_KEYS.DRIVERS,
    apiEndpoint: '/api/drivers/toggle-status'
  });
  
  // Helper function to check if all documents are verified
  const isAllDocumentsVerified = useCallback((driver: any) => {
    // Check if all required documents are verified
    const requiredDocuments = [
      driver.IsDLFrontImageVerified,
      driver.IsDLBackImageVerified,
      driver.IsPanImgVerified,
      driver.IsFSAdhaarImgVerified,
      driver.IsBSAdhaarImgVerified,
    ];
    
    // Return true only if all documents are verified (not null/undefined and true)
    return requiredDocuments.every(doc => doc === true);
  }, []);

  // Helper function to get verification count
  const getVerificationCount = useCallback((driver: any) => {
    const requiredDocuments = [
      driver.IsDLFrontImageVerified,
      driver.IsDLBackImageVerified,
      driver.IsPanImgVerified,
      driver.IsFSAdhaarImgVerified,
      driver.IsBSAdhaarImgVerified,
    ];
    
    return requiredDocuments.filter(doc => doc === true).length;
  }, []);

  // Helper function to get verification details
  const getVerificationDetails = useCallback((driver: any) => {
    const documents = [
      { name: 'License Front', verified: driver.IsDLFrontImageVerified },
      { name: 'License Back', verified: driver.IsDLBackImageVerified },
      { name: 'PAN Card', verified: driver.IsPanImgVerified },
      { name: 'Aadhar Front', verified: driver.IsFSAdhaarImgVerified },
      { name: 'Aadhar Back', verified: driver.IsBSAdhaarImgVerified },
    ];
    
    return documents;
  }, []);
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("drivers:view"),
    edit: hasPermission("drivers:edit"),
    documents: hasPermission("drivers:documents"),
    suspend: hasPermission("drivers:suspend"),
    create: hasPermission("drivers:create"),
    export: hasPermission("drivers:export"),
  }), [hasPermission]);

  const fetchDrivers = async() => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(accountStatus && { accountStatus }),
        ...(onlineStatus && { onlineStatus }),
        ...(verificationStatus && { verificationStatus })
      });

      const response = await fetch(`/api/drivers?${params}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching drivers:", error);
      throw error;
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.DRIVERS, page, search, accountStatus, onlineStatus, verificationStatus],
    queryFn: fetchDrivers,
  });

  const drivers = data?.drivers || [];
  console.log("drivers"+JSON.stringify(drivers));
  const pagination = data?.pagination || { total: 0, page: 1, pageSize, totalPages: 0 };

  // Memoize action handlers
  const handleView = useCallback((driverId: string) => {
    console.log("View driver:", driverId);
    },[]);
  


  const handleEdit = useCallback((driverId: string) => {
    console.log("Edit driver:", driverId);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on new search
  }, []);

  const handleAccountStatusChange = useCallback((value: string) => {
    setAccountStatus(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const handleOnlineStatusChange = useCallback((value: string) => {
    setOnlineStatus(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const handleVerificationStatusChange = useCallback((value: string) => {
    setVerificationStatus(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setAccountStatus("");
    setOnlineStatus("");
    setVerificationStatus("");
    setPage(1);
  }, []);

  const handleDocuments = useCallback((driverId: string) => {
    console.log("View documents:", driverId);
  }, []);

  // Use the universal status toggle hook
  const { toggleStatus: toggleDriverStatus } = useStatusToggle({
    entityType: 'driver',
    cacheKey: CACHE_KEYS.DRIVERS,
    apiEndpoint: '/api/drivers/toggle-status'
  });

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    drivers.map((driver: any) => (
      <TableRow key={driver.Id}>
        <TableCell className="font-medium">{driver.Name}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.Email}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant={
              driver.IsActive
                ? "default"
                : "secondary"
            }
          >
            {driver.IsActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{driver.DriverVehicle?.[0]?.Vehicle?.Name || '-'}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.rating || '-'}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.Bookings?.length || 0}</TableCell>
        <TableCell className="hidden md:table-cell">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col gap-1 cursor-help">
                  <Badge
                    variant={
                      isAllDocumentsVerified(driver)
                        ? "default"
                        : "secondary"
                    }
                    className="w-fit"
                  >
                    {isAllDocumentsVerified(driver) ? "Verified" : "Pending"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {getVerificationCount(driver)}/5 documents
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">Document Verification Status:</p>
                  {getVerificationDetails(driver).map((doc, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${doc.verified ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm">{doc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {doc.verified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleViewDocuments(driver)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {/* {permissions.edit && (
                <Button variant="ghost" size="icon" onClick={() => handleEdit(driver.Id)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {true && (
                <Button variant="ghost" size="icon" onClick={() => handleViewDocuments(driver.Id)}>
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">Documents</span>
                </Button>
              )} */}
              {permissions.suspend && (
                <StatusToggleButton
                  entityId={driver.Id}
                  entityName={driver.Name}
                  entityType="driver"
                  isActive={driver.IsActive}
                  onToggle={toggleDriverStatus}
                />
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [drivers, permissions, handleView, handleEdit, handleDocuments, isAllDocumentsVerified, getVerificationCount, getVerificationDetails]);

  // Fetch driver details when selected
  const cacheManager = useCacheManager(queryClient);
  const { invalidateDriverCache, apiCallWithCacheInvalidation } = useCacheInvalidation();
  const { data: driverData, isLoading: isLoadingDriver } = useQuery({
    queryKey: [CACHE_KEYS.DRIVER, selectedDriver?.Id],
    queryFn: async () => {
      if (!selectedDriver) return null;
      const response = await fetch(`/api/drivers/${selectedDriver.Id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Driver not found");
        }
        throw new Error("Failed to fetch driver details");
      }
      //console.log("driverDetails"+ JSON.stringify(await response.json()));
      return await response.json();
    },
    enabled: !!selectedDriver,
  });
  console.log("driverData"+driverData);

  const handleViewDocuments = useCallback((driver: any) => {
    setSelectedDriver(driver);
    setIsDocumentsOpen(true);
  }, []);

  const handleViewImage = useCallback((imageUrl: string) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Error",
        description: "Image URL is not available",
        variant: "destructive"
      });
    }
  }, []);

  const handleDownload = async (fileKey: string, fileName: string) => {
    try {
      if (!fileKey) {
        toast({
          title: "Error",
          description: "File URL is not available",
          variant: "destructive"
        });
        return;
      }

      // Show loading toast
      toast({
        title: "Downloading...",
        description: "Your file download will start shortly",
      });

      const response = await fetch(`/api/download?key=${encodeURIComponent(fileKey)}&name=${encodeURIComponent(fileName)}`)
      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Show success toast
      toast({
        title: "Success",
        description: `${fileName} downloaded successfully`,
      });
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleVerify = useCallback(async (driverId: string, documentType: string) => {
    const operationKey = `${driverId}-${documentType}`;
    setVerifyingDocuments(prev => new Set(prev).add(operationKey));
    
    // Show immediate feedback toaster
    toast({
      title: "Verifying...",
      description: "Please wait while we verify the document.",
    });
    
    try {
      await apiCallWithCacheInvalidation(
        `/api/drivers/${driverId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentType }),
        },
        () => invalidateDriverCache(driverId),
        "Document verified successfully!",
        "Failed to verify document"
      );
    } finally {
      setVerifyingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationKey);
        return newSet;
      });
    }
  }, [apiCallWithCacheInvalidation, invalidateDriverCache]);

  const handleReject = useCallback(async (driverId: string) => {
    // Show immediate feedback toaster
    toast({
      title: "Rejecting...",
      description: "Please wait while we process the rejection.",
    });
    
    await apiCallWithCacheInvalidation(
      `/api/drivers/${driverId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      },
      () => invalidateDriverCache(driverId),
      "Driver rejected successfully!",
      "Failed to reject driver"
    );
  }, [apiCallWithCacheInvalidation, invalidateDriverCache]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search drivers..." 
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
                      Filter drivers by status and verification
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Account Status</Label>
                      <Select value={accountStatus || 'all'} onValueChange={handleAccountStatusChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Drivers</SelectItem>
                          <SelectItem value="active">Active Drivers</SelectItem>
                          <SelectItem value="inactive">Inactive Drivers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Online Status</Label>
                      <Select value={onlineStatus || 'all'} onValueChange={handleOnlineStatusChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select online status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Drivers</SelectItem>
                          <SelectItem value="online">Online Drivers</SelectItem>
                          <SelectItem value="offline">Offline Drivers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Verification Status</Label>
                      <Select value={verificationStatus || 'all'} onValueChange={handleVerificationStatusChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select verification status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Drivers</SelectItem>
                          <SelectItem value="verified">Fully Verified</SelectItem>
                          <SelectItem value="pending">Pending Verification</SelectItem>
                          <SelectItem value="partially">Partially Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(search || accountStatus || onlineStatus || verificationStatus) && (
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
          <div className="py-12 text-center">Loading drivers...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">Error loading drivers</div>
        ) : (
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
                  <TableHead className="hidden md:table-cell">Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {search || accountStatus || onlineStatus || verificationStatus ? 'No drivers found matching your criteria' : 'No drivers found'}
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
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, pagination.total)} of {pagination.total} drivers
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

      {/* Documents Dialog */}
      <Dialog open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b mb-2">
            <DialogTitle className="text-lg font-semibold">
              {driverData?.Name}'s Documents
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 pt-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoadingDriver ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 min-h-0">
                {/* License */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Driver's License</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {driverData?.DriverLicenseFrontImage ? (
                      <div className="space-y-4">
                        <div className="relative group">
                          <img
                            src={driverData.DriverLicenseFrontImage}
                            alt="License"
                            className="w-full h-40 md:h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => handleViewImage(driverData.DriverLicenseFrontImage)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewImage(driverData.DriverLicenseFrontImage)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDownload(driverData.DriverLicenseFrontImage, `${driverData.Name}-license.jpg`)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewImage(driverData.DriverLicenseFrontImage)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(driverData.DriverLicenseFrontImage, `${driverData.Name}-license.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {!driverData.IsDLFrontImageVerified && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(driverData.Id, 'dl-front')}
                              disabled={verifyingDocuments.has(`${driverData.Id}-dl-front`)}
                            >
                              {verifyingDocuments.has(`${driverData.Id}-dl-front`) ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Verify
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 md:h-48 bg-muted rounded-lg flex items-center justify-center">
                        No license uploaded
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Aadhar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Driveing License Back Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {driverData?.DriverLicenseBackImage ? (
                      <div className="space-y-4">
                        <div className="relative group">
                          <img
                            src={driverData.DriverLicenseBackImage}
                            alt="Driving License Back Image"
                            className="w-full h-40 md:h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => handleViewImage(driverData.DriverLicenseBackImage)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewImage(driverData.DriverLicenseBackImage)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDownload(driverData.DriverLicenseBackImage, `${driverData.Name}-license-back.jpg`)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewImage(driverData.DriverLicenseBackImage)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(driverData.DriverLicenseBackImage, `${driverData.Name}-back.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {!driverData.IsDLBackImageVerified && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(driverData.Id, 'dl-back')}
                              disabled={verifyingDocuments.has(`${driverData.Id}-dl-back`)}
                            >
                              {verifyingDocuments.has(`${driverData.Id}-dl-back`) ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Verify
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 md:h-48 bg-muted rounded-lg flex items-center justify-center">
                        No Driving License uploaded
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* PAN */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">PAN Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {driverData?.PanImage ? (
                      <div className="space-y-4">
                        <div className="relative group">
                          <img
                            src={driverData.PanImage}
                            alt="PAN"
                            className="w-full h-40 md:h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => handleViewImage(driverData.PanImage)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewImage(driverData.PanImage)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDownload(driverData.PanImage, `${driverData.Name}-pan.jpg`)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewImage(driverData.PanImage)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(driverData.PanImage, `${driverData.Name}-pan.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {!driverData.IsPanImgVerified && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(driverData.Id, 'pan')}
                              disabled={verifyingDocuments.has(`${driverData.Id}-pan`)}
                            >
                              {verifyingDocuments.has(`${driverData.Id}-pan`) ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Verify
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 md:h-48 bg-muted rounded-lg flex items-center justify-center">
                        No PAN uploaded
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Picture */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Profile Picture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {driverData?.DriverImage ? (
                      <div className="space-y-4">
                        <div className="relative group">
                          <img
                            src={driverData.DriverImage}
                            alt="Profile"
                            className="w-full h-40 md:h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => handleViewImage(driverData.DriverImage)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewImage(driverData.DriverImage)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDownload(driverData.DriverImage, `${driverData.Name}-profile.jpg`)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewImage(driverData.DriverImage)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(driverData.DriverImage, `${driverData.Name}-profile.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 md:h-48 bg-muted rounded-lg flex items-center justify-center">
                        No profile picture uploaded
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Aadhar Front Side</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {driverData?.FrontSideAdhaarImage ? (
                      <div className="space-y-4">
                        <div className="relative group">
                          <img
                            src={driverData.FrontSideAdhaarImage}
                            alt="Aadhar Front"
                            className="w-full h-40 md:h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => handleViewImage(driverData.FrontSideAdhaarImage)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewImage(driverData.FrontSideAdhaarImage)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDownload(driverData.FrontSideAdhaarImage, `${driverData.Name}-aadhar-front.jpg`)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewImage(driverData.FrontSideAdhaarImage)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(driverData.FrontSideAdhaarImage, `${driverData.Name}-aadhar-front.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {!driverData.IsFSAdhaarImgVerified && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(driverData.Id, 'aadhar-front')}
                              disabled={verifyingDocuments.has(`${driverData.Id}-aadhar-front`)}
                            >
                              {verifyingDocuments.has(`${driverData.Id}-aadhar-front`) ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Verify
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 md:h-48 bg-muted rounded-lg flex items-center justify-center">
                        Aadhar Front Side not uploaded
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Aadhar Back Side</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {driverData?.BackSideAdhaarImage ? (
                      <div className="space-y-4">
                        <div className="relative group">
                          <img
                            src={driverData.BackSideAdhaarImage}
                            alt="Aadhar Back"
                            className="w-full h-40 md:h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => handleViewImage(driverData.BackSideAdhaarImage)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewImage(driverData.BackSideAdhaarImage)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDownload(driverData.BackSideAdhaarImage, `${driverData.Name}-aadhar-back.jpg`)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewImage(driverData.BackSideAdhaarImage)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(driverData.BackSideAdhaarImage, `${driverData.Name}-aadhar-back.jpg`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {!driverData.IsBSAdhaarImgVerified && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(driverData.Id, 'aadhar-back')}
                              disabled={verifyingDocuments.has(`${driverData.Id}-aadhar-back`)}
                            >
                              {verifyingDocuments.has(`${driverData.Id}-aadhar-back`) ? (
                                <>
                                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Verify
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 md:h-48 bg-muted rounded-lg flex items-center justify-center">
                        Aadhar Back Side not uploaded
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Verification Actions */}
            {driverData?.Status === 'pending' && (
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => handleVerify(driverData.Id, 'dl-front')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(driverData.Id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
