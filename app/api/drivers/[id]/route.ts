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
      
      // Fetch driver details with all related information including verification fields
      const driver = await prisma.driver.findUnique({
        where: {
          Id: driverId,
        },
        select: {
          Id: true,
          Name: true,
          Email: true,
          MobileNumber: true,
          CreatedDate: true,
          
          // Document fields
          DrivingLicenceFrontImage: true,
          DrivingLicenceBackImage: true,
          PanImage: true,
          DriverImage: true,
          FrontSideAdhaarImage: true,
          BackSideAdhaarImage: true,
          // Verification fields
          IsDLFrontImageVerified: true,
          IsDLBackImageVerified: true,
          IsPanImgVerified: true,
          IsFSAdhaarImgVerified: true,
          IsBSAdhaarImgVerified: true,
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
        DriverImage: string,
        FrontSideAdhaarImage: string,
        BackSideAdhaarImage: string
      }
  
      const driverDocuments: DriverDocument = {
        DriverLicenseFrontImage: await getObjectSignedUrl(driver.DrivingLicenceFrontImage as string) as string,
        DriverLicenseBackImage: await getObjectSignedUrl(driver.DrivingLicenceBackImage ) as string,
        PanImage: await getObjectSignedUrl(driver.PanImage as string) as string,
        DriverImage: await getObjectSignedUrl(driver.DriverImage ) as string,
        FrontSideAdhaarImage: await getObjectSignedUrl(driver.FrontSideAdhaarImage as string) as string,
        BackSideAdhaarImage: await getObjectSignedUrl(driver.BackSideAdhaarImage as string) as string,
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

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const driverId = parseInt(params.id, 10);
    const body = await request.json();
    const { documentType } = body;

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      );
    }

    // Define the verification field mapping
    const verificationFields = {
      'dl-front': 'IsDLFrontImageVerified',
      'dl-back': 'IsDLBackImageVerified', 
      'pan': 'IsPanImgVerified',
      'aadhar-front': 'IsFSAdhaarImgVerified',
      'aadhar-back': 'IsBSAdhaarImgVerified',
    };

    const verificationField = verificationFields[documentType as keyof typeof verificationFields];
    
    if (!verificationField) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // Update the verification status
    const updatedDriver = await prisma.driver.update({
      where: { Id: driverId },
      data: {
        [verificationField]: true,
      },
      select: {
        Id: true,
        Name: true,
        IsDLFrontImageVerified: true,
        IsDLBackImageVerified: true,
        IsPanImgVerified: true,
        IsFSAdhaarImgVerified: true,
        IsBSAdhaarImgVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${documentType} document verified successfully`,
      driver: updatedDriver,
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json(
      { error: "Failed to verify document" },
      { status: 500 }
    );
  }
}

