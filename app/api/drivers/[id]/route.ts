import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";
import { getObjectSignedUrl } from "@/app/actions/s3-actions";


export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
  ) {
    try {
      // Await the params object before destructuring
      const params = await context.params;
      const driverId = parseInt(params.id, 10);
      
      console.log("id:", params.id);
      
      // Fetch driver details with all related information
      const driver = await prisma.driver.findUnique({
        where: {
          Id: driverId,
        },
        select: {
          Id: true,
          Name: true,
          Email: true,
          MobileNumber: true,
          //Status: true,
          CreatedDate: true,
          // Document fields
          DrivingLicenceFrontImage: true,
          DrivingLicenceBackImage: true,
          PanImage: true,
          DriverImage: true,
          // Additional fields you might need
        },
      });
  
      if (!driver) {
        return NextResponse.json(
          { error: "Driver not found" },
          { status: 404 }
        );
      }
  
      type DriverDocument = {
        DriverLicenseFrontImage: string,
        DriverLicenseBackImage: string,
        PanImage: string,
        DriverImage: string

      }
  
      const driverDocuments: DriverDocument = {
        DriverLicenseFrontImage: await getObjectSignedUrl(driver.DrivingLicenceFrontImage as string) as string,
        DriverLicenseBackImage: await getObjectSignedUrl(driver.DrivingLicenceBackImage ) as string,
        PanImage: await getObjectSignedUrl(driver.PanImage) as string,
        DriverImage: await getObjectSignedUrl(driver.DriverImage ) as string,
        
      }
  
      console.log("test123"+JSON.stringify(driverDocuments));
      // Transform the data to include computed fields
      const transformedDriver = {
        ...driver,
        ...driverDocuments
      };
  
      return NextResponse.json(transformedDriver);
    } catch (error) {
      console.error('Error fetching driver details:', error);
      return NextResponse.json(
        { error: "Failed to fetch driver details" },
        { status: 500 }
      );
    }
  }
// Add PATCH method for updating driver status (verification)

