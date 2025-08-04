"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useCacheManager, CACHE_KEYS } from "@/lib/cache-utils"
import { useCacheInvalidation } from "@/hooks/use-cache-invalidation"

export default function DriversPage() {
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [verifyingDocuments, setVerifyingDocuments] = useState<Set<string>>(new Set());
  
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
    const data = await fetch(`/api/drivers?page=${page}&pageSize=${pageSize}`);
    const json = await data.json();
    return json;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.DRIVERS, page],
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

  const handleDocuments = useCallback((driverId: string) => {
    console.log("View documents:", driverId);
  }, []);

  const handleSuspend = useCallback((driverId: string) => {
    console.log("Suspend driver:", driverId);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    drivers.map((driver: any) => (
      <TableRow key={driver.Id}>
        <TableCell className="font-medium">{driver.Name}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.Email}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant={
              driver.IsOnline
                ? "default"
                : "secondary"
            }
          >
            {driver.IsOnline ? "active" : "inactive"}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{driver.DriverVehicle?.[0]?.Vehicle?.Name || '-'}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.rating || '-'}</TableCell>
        <TableCell className="hidden md:table-cell">{driver.Bookings?.length || 0}</TableCell>
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
                <Button variant="ghost" size="icon" onClick={() => handleSuspend(driver.Id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Suspend</span>
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [drivers, permissions, handleView, handleEdit, handleDocuments, handleSuspend]);

  // Fetch driver details when selected
  const queryClient = useQueryClient();
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
      window.open(imageUrl, '_blank');
    }
  }, []);

  const handleDownload = async (fileKey: string, fileName: string) => {
    try {
      const response = await fetch(`/api/download?key=${encodeURIComponent(fileKey)}&name=${encodeURIComponent(fileName)}`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleVerify = useCallback(async (driverId: string, documentType: string) => {
    const operationKey = `${driverId}-${documentType}`;
    setVerifyingDocuments(prev => new Set(prev).add(operationKey));
    
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
        {permissions.create && (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        )}
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
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead className="hidden md:table-cell">Rating</TableHead>
                <TableHead className="hidden md:table-cell">Rides</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </div>
        
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {driverData?.Name}'s Documents
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {isLoadingDriver ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* License */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Driver's License</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {driverData?.DriverLicenseFrontImage ? (
                      <div className="space-y-4">
                        <img
                          src={driverData.DriverLicenseFrontImage}
                          alt="License"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="flex justify-end gap-2">
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
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
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
                        <img
                          src={driverData.DriverLicenseBackImage  }
                          alt="Driving License Back Image"
                          className="w-full h-48 object-cover rounded-lg"
                        />
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
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
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
                        <img
                          src={driverData.PanImage}
                          alt="PAN"
                          className="w-full h-48 object-cover rounded-lg"
                        />
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
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
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
                    {driverData?.ProfileImage ? (
                      <div className="space-y-4">
                        <img
                          src={driverData.DriverImage}
                          alt="Profile"
                          className="w-full h-48 object-cover rounded-lg"
                        />
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
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
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
                        <img
                          src={driverData.FrontSideAdhaarImage}
                          alt="Aadhar Front"
                          className="w-full h-48 object-cover rounded-lg"
                        />
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
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
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
                        <img
                          src={driverData.BackSideAdhaarImage}
                          alt="Aadhar Back"
                          className="w-full h-48 object-cover rounded-lg"
                        />
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
                      <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
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
