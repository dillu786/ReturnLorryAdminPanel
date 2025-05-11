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
  const pageSize = 10

  // Fetch drivers with their documents
  const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["drivers", page, search],
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
    queryKey: ["owners", page, search],
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
      window.open(imageUrl, '_blank')
    }
  }, [])

  const handleDownload = useCallback(async (imageUrl: string, fileName: string) => {
    if (imageUrl) {
      try {
        const response = await fetch(imageUrl)
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
        console.error('Error downloading document:', error)
      }
    }
  }, [])

  const handleVerify = useCallback(async (userId: string, userType: 'driver' | 'owner') => {
    // Implement verification logic
    console.log('Verify', userId, userType)
  }, [])

  const handleReject = useCallback(async (userId: string, userType: 'driver' | 'owner') => {
    // Implement rejection logic
    console.log('Reject', userId, userType)
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
              <div className="relative group">
                <img
                  src={user.LicenseImage}
                  alt="License"
                  className="h-32 w-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
              <div className="relative group">
                <img
                  src={user.AadharImage}
                  alt="Aadhar"
                  className="h-32 w-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
              <div className="relative group">
                <img
                  src={user.PanImage}
                  alt="PAN"
                  className="h-32 w-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
              <div className="relative group">
                <img
                  src={user.ProfileImage}
                  alt="Profile"
                  className="h-32 w-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
