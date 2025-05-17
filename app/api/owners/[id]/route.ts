import { NextResponse } from "next/server"
import prisma from "@/db/prisma/prisma";
import { getObjectSignedUrl } from "@/app/actions/s3-actions";
import { on } from "events";
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

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const ownerId = parseInt(params.id, 10);
    const owner = await prisma.owner.findUnique({
      where: {
        Id: ownerId
      },
      include: {
        OwnerDriver: {
          include: {
            Driver: {
              select: {
                Id: true,
                Name: true,
                MobileNumber: true,
                Email: true,
                DriverImage: true
              }
            }
          }
        },
        OwnerVehicle: {
          include: {
            Vehicle: {
              select: {
                Id: true,
                Model: true,
                Year: true,
                Category: true,
                VehicleNumber: true,
                VehicleImage: true,
                VehicleInsuranceImage: true,
                PermitImage: true
              }
            }
          }
        }
      }
    })

   if (owner!=null){
   // let vehicleDoc: VehicleDocument[]=[]
    const vehicleDoc = await Promise.all(
      owner.OwnerVehicle.map(async (vehicle) => {
        const [vehicleImage, permitImage, insuranceImage] = await Promise.all([
          getObjectSignedUrl(vehicle.Vehicle.VehicleImage as string)?? null,
          getObjectSignedUrl(vehicle.Vehicle.PermitImage as string)?? null,
          getObjectSignedUrl(vehicle.Vehicle.VehicleInsuranceImage as string)?? null,
        ]);
    
        return {
          Model: vehicle.Vehicle.Model as string,
          Id: vehicle.Id,
          VehicleImage: vehicleImage ?? null,
          VehicleNumber: vehicle.Vehicle.VehicleNumber,
          PermitImage: (await getObjectSignedUrl(vehicle.Vehicle.PermitImage as string)) ?? null,
          VehicleInsuranceImage: (await getObjectSignedUrl(vehicle.Vehicle.VehicleInsuranceImage as string)) ?? null,
          Year: vehicle.Vehicle.Year,
          Category: vehicle.Vehicle.Category
        };
      })
    );
    

    let driverDets: DriverDetails[]=[]

    for(let driver of owner.OwnerDriver){
        driverDets.push({
          Name: driver.Driver.Name as string,
          DriverImage: await getObjectSignedUrl(driver.Driver.DriverImage as string)??null,
          Email: driver.Driver.Email as string,
          MobileNumber:driver.Driver.MobileNumber as string,
          Id: driver.Driver.Id
        })
      
    }
  
     
     const ownerResponse: Owner = {
       Id: owner.Id,
       Name: owner.Name,
       DOB: owner.DOB as any,
       Email:owner.Email,
       Gender:owner.Gender,
       MobileNumber:owner.MobileNumber,
       CreatedDate: owner.CreatedDate as any,
       LastLoggedIn:owner.LastLoggedIn as any,
       
       AdhaarCardNumber:owner.AdhaarCardNumber,
       PanNumber:owner.PanNumber,
       FrontSideAdhaarImage: await getObjectSignedUrl(owner.FrontSideAdhaarImage as string)?? null,
       BackSideAdhaarImage: await getObjectSignedUrl(owner.BackSideAdhaarImage as string )?? null,
       PanImage: await getObjectSignedUrl(owner.PanImage as string)?? null,
       OwnerImage: await getObjectSignedUrl(owner.OwnerImage as string )?? null,
       Vehicle: vehicleDoc,
       driver: driverDets
       
     }
     console.log(ownerResponse);
     return NextResponse.json(ownerResponse)
   
    }

  

    if (!owner) {
      return new NextResponse("Owner not found", { status: 404 })
    }


  } catch (error) {
    console.error("[OWNER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 