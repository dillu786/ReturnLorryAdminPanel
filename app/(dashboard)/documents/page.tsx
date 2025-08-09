"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Eye, Check, X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { CACHE_KEYS } from "@/lib/cache-utils"
import { toast } from "@/components/ui/use-toast"

// Mock permissions - replace with your actual permission system
const permissions = {
  view: true,
  download: true,
  verify: true,
  reject: true,
}

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("drivers")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Fetch drivers with their documents
  const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
    queryKey: [CACHE_KEYS.DRIVERS, page, search],
    queryFn: async () => {
      const response = await fetch(
        `/api/drivers?page=${page}&pageSize=${pageSize}&search=${search}`
      )
      if (!response.ok) throw new Error("Failed to fetch drivers")
      return response.json()
    },
    enabled: activeTab === "drivers",
  })

  // Fetch owners with their documents
  const { data: ownersData, isLoading: isLoadingOwners } = useQuery({
    queryKey: [CACHE_KEYS.OWNERS, page, search],
    queryFn: async () => {
      const response = await fetch(
        `/api/owners?page=${page}&pageSize=${pageSize}&search=${search}`
      )
      if (!response.ok) throw new Error("Failed to fetch owners")
      return response.json()
    },
    enabled: activeTab === "owners",
  })

  const handleView = useCallback((imageUrl: string) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer')
    } else {
      toast({
        title: "Error",
        description: "Image URL is not available",
        variant: "destructive"
      });
    }
  }, [])

  const handleDownload = useCallback(async (imageUrl: string, fileName: string) => {
    try {
      if (!imageUrl) {
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

      const response = await fetch(`/api/download?key=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(fileName)}`)
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
  }, [])

  const handleVerify = useCallback(async (userId: string, userType: 'driver' | 'owner') => {
    // Show loading toast
    toast({
      title: "Verifying...",
      description: "Please wait while we verify the documents.",
    });
    
    try {
      // Implement verification logic
      console.log('Verify', userId, userType)
      
      // Show success toast
      toast({
        title: "Success",
        description: "Documents verified successfully",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Failed to verify documents. Please try again.",
        variant: "destructive"
      });
    }
  }, [])

  const handleReject = useCallback(async (userId: string, userType: 'driver' | 'owner') => {
    // Show loading toast
    toast({
      title: "Processing...",
      description: "Please wait while we process the rejection.",
    });
    
    try {
      // Implement rejection logic
      console.log('Reject', userId, userType)
      
      // Show success toast
      toast({
        title: "Success",
        description: "Documents rejected successfully",
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject documents. Please try again.",
        variant: "destructive"
      });
    }
  }, [])

  const renderUserDocuments = (user: any, userType: 'driver' | 'owner') => (
    <Card key={user.Id} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {user.Name} ({user.Email})
        </CardTitle>
        <Badge variant={user.Status === 'active' ? 'default' : 'secondary'}>
          {user.Status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* License */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Driver's License</div>
            {user.LicenseImage ? (
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={user.LicenseImage}
                    alt="License"
                    className="h-32 w-full object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => handleView(user.LicenseImage)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleView(user.LicenseImage)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleDownload(user.LicenseImage, `${user.Name}-license.jpg`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(user.LicenseImage)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(user.LicenseImage, `${user.Name}-license.jpg`)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                No license uploaded
              </div>
            )}
          </div>

          {/* Aadhar */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Aadhar Card</div>
            {user.AadharImage ? (
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={user.AadharImage}
                    alt="Aadhar"
                    className="h-32 w-full object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => handleView(user.AadharImage)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleView(user.AadharImage)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleDownload(user.AadharImage, `${user.Name}-aadhar.jpg`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(user.AadharImage)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(user.AadharImage, `${user.Name}-aadhar.jpg`)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                No Aadhar uploaded
              </div>
            )}
          </div>

          {/* PAN */}
          <div className="space-y-2">
            <div className="text-sm font-medium">PAN Card</div>
            {user.PanImage ? (
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={user.PanImage}
                    alt="PAN"
                    className="h-32 w-full object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => handleView(user.PanImage)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleView(user.PanImage)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleDownload(user.PanImage, `${user.Name}-pan.jpg`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(user.PanImage)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(user.PanImage, `${user.Name}-pan.jpg`)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                No PAN uploaded
              </div>
            )}
          </div>

          {/* Profile Picture */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Profile Picture</div>
            {user.ProfileImage ? (
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={user.ProfileImage}
                    alt="Profile"
                    className="h-32 w-full object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => handleView(user.ProfileImage)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleView(user.ProfileImage)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleDownload(user.ProfileImage, `${user.Name}-profile.jpg`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(user.ProfileImage)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(user.ProfileImage, `${user.Name}-profile.jpg`)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                No profile picture uploaded
              </div>
            )}
          </div>
        </div>

        {/* Verification Actions */}
        {user.Status === 'pending' && (
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerify(user.Id, userType)}
            >
              <Check className="h-4 w-4 mr-2" />
              Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReject(user.Id, userType)}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Documents</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="owners">Owners</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          {isLoadingDrivers ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {driversData?.drivers.map((driver: any) => renderUserDocuments(driver, 'driver'))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="owners">
          {isLoadingOwners ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {ownersData?.owners.map((owner: any) => renderUserDocuments(owner, 'owner'))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
