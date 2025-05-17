"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Car, User, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DriverDetails{
  Id: number
  Name: string
  MobileNumber: string
  Email: string | null
  DriverImage: string | null
}

interface VehicleDocument{
  Id: number
  Model: string
  Year: string
  Category: string
  VehicleNumber: string
  VehicleImage: string | null
  VehicleInsuranceImage: string | null
  PermitImage: string | null
}
interface Owner {
  Id: number
  Name: string
  Email: string | null
  MobileNumber: string
  DOB: string | null
  Gender: string
  AdhaarCardNumber: string | null
  FrontSideAdhaarImage: string | null
  BackSideAdhaarImage: string | null
  PanNumber: string | null
  PanImage: string | null
  OwnerImage: string | null
  CreatedDate: string
  LastLoggedIn: string
  driver:DriverDetails[]
  Vehicle: VehicleDocument[]
  
}

export default function OwnerDetailsPage() {
  const params = useParams()
  const ownerId = params.id as string

  const { data: owner, isLoading, error } = useQuery<Owner>({
    queryKey: ["owner", ownerId],
    queryFn: async () => {
      const response = await fetch(`/api/owners/${ownerId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch owner details")
      }
      const data = await response.json();
      console.log("ownnners data "+JSON.stringify(data));
      return data;
    }
  })

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

  if (isLoading) {
    return <div className="p-8">Loading owner details...</div>
  }

  if (error || !owner) {
    return <div className="p-8 text-red-500">Error loading owner details</div>
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={owner.OwnerImage || undefined} />
          <AvatarFallback>{owner.Name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{owner.Name}</h1>
          <p className="text-muted-foreground">{owner.Email}</p>
          <p className="text-muted-foreground">{owner.MobileNumber}</p>
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="drivers">
            <User className="mr-2 h-4 w-4" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            <Car className="mr-2 h-4 w-4" />
            Vehicles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identity Documents</CardTitle>
              <CardDescription>Owner's identity and verification documents</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium">Aadhaar Card</h3>
                <p className="text-sm text-muted-foreground">Number: {owner.AdhaarCardNumber || "Not provided"}</p>
                <div className="grid grid-cols-2 gap-4">
                  {owner.FrontSideAdhaarImage && (
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border">
                      <img
                        src={owner.FrontSideAdhaarImage}
                        alt="Aadhaar Front"
                        className="object-cover"
                      />
                    </div>
                  )}
                  {owner.BackSideAdhaarImage && (
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border">
                      <img
                        src={owner.BackSideAdhaarImage}
                        alt="Aadhaar Back"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">PAN Card</h3>
                <p className="text-sm text-muted-foreground">Number: {owner.PanNumber || "Not provided"}</p>
                {owner.PanImage && (
                  <div className="relative aspect-[3/2] overflow-hidden rounded-lg border">
                    <img
                      src={owner.PanImage}
                      alt="PAN Card"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Associated Drivers</CardTitle>
              <CardDescription>List of drivers associated with this owner</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owner.driver.map((driver:any) => (
                    <TableRow key={driver.Id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={driver.DriverImage || undefined} />
                            <AvatarFallback>{driver.Name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {driver.Name}
                        </div>
                      </TableCell>
                      <TableCell>{driver.MobileNumber}</TableCell>
                      <TableCell>{driver.Email || "Not provided"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Registered Vehicles</CardTitle>
              <CardDescription>List of vehicles registered under this owner</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {owner.Vehicle.map((Vehicle:any) => (
                  <Card key={Vehicle.Id} className="overflow-hidden">
                    <div className="relative">
                      {Vehicle.VehicleImage ? (
                        <div className="relative aspect-video overflow-hidden group cursor-pointer">
                          <img
                            src={Vehicle.VehicleImage}
                            alt={`${Vehicle.Model} ${Vehicle.VehicleNumber}`}
                            className="object-cover w-full h-full transition-all duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
                            <p className="text-white text-sm font-medium">Vehicle Image</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:text-white hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(Vehicle.VehicleImage, `${Vehicle.Model}-${Vehicle.VehicleNumber}.jpg`)
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <Car className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="backdrop-blur-sm bg-white/80">{Vehicle.Category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{Vehicle.Model}</h3>
                          <p className="text-sm text-muted-foreground">{Vehicle.VehicleNumber}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Year</p>
                            <p className="font-medium">{Vehicle.Year}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Category</p>
                            <p className="font-medium">{Vehicle.Category}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Documents</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Vehicle.VehicleInsuranceImage && (
                              <div className="group relative aspect-[3/4] overflow-hidden rounded-lg border">
                                <img
                                  src={Vehicle.VehicleInsuranceImage}
                                  alt="Insurance"
                                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                  <p className="text-white text-sm">Vehicle Insurance Image</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:text-white hover:bg-white/20"
                                    onClick={() => handleDownload(Vehicle.VehicleInsuranceImage, `${Vehicle.Model}-insurance.jpg`)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            )}
                            {Vehicle.PermitImage && (
                              <div className="group relative aspect-[3/4] overflow-hidden rounded-lg border">
                                <img
                                  src={Vehicle.PermitImage}
                                  alt="Permit"
                                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                  <p className="text-white text-sm">Vehicle Permit Image</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:text-white hover:bg-white/20"
                                    onClick={() => handleDownload(Vehicle.PermitImage, `${Vehicle.Model}-permit.jpg`)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 