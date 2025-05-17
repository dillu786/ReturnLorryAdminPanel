// app/components/owner-details-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface OwnerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  owner: any // We'll type this properly once we have the API response
}

export function OwnerDetailsModal({ isOpen, onClose, owner }: OwnerDetailsModalProps) {
  if (!owner) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Owner Details - {owner.Name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          </TabsList>
          <TabsContent value="documents" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {owner.FrontSideAdhaarImage && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Aadhaar Card (Front)</h3>
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={owner.FrontSideAdhaarImage}
                          alt="Aadhaar Front"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                {owner.BackSideAdhaarImage && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Aadhaar Card (Back)</h3>
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={owner.BackSideAdhaarImage}
                          alt="Aadhaar Back"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                {owner.PanImage && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">PAN Card</h3>
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={owner.PanImage}
                          alt="PAN Card"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                {owner.OwnerImage && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Profile Image</h3>
                      <div className="relative aspect-square w-full">
                        <Image
                          src={owner.OwnerImage}
                          alt="Profile"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="vehicles" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {owner.OwnerVehicle?.map((vehicle: any) => (
                  <Card key={vehicle.Id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{vehicle.Vehicle.Model} ({vehicle.Vehicle.Year})</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Category:</span> {vehicle.Vehicle.Category}</p>
                        <p><span className="font-medium">Vehicle Number:</span> {vehicle.Vehicle.VehicleNumber}</p>
                        {vehicle.Vehicle.VehicleImage && (
                          <div className="relative aspect-video w-full mt-2">
                            <Image
                              src={vehicle.Vehicle.VehicleImage}
                              alt={`${vehicle.Vehicle.Model} image`}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                        {vehicle.Vehicle.VehicleInsuranceImage && (
                          <div className="mt-2">
                            <h4 className="font-medium mb-1">Insurance Document</h4>
                            <div className="relative aspect-[3/4] w-full">
                              <Image
                                src={vehicle.Vehicle.VehicleInsuranceImage}
                                alt="Insurance Document"
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          </div>
                        )}
                        {vehicle.Vehicle.PermitImage && (
                          <div className="mt-2">
                            <h4 className="font-medium mb-1">Permit Document</h4>
                            <div className="relative aspect-[3/4] w-full">
                              <Image
                                src={vehicle.Vehicle.PermitImage}
                                alt="Permit Document"
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}