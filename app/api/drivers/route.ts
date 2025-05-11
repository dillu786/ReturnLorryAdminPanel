import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";

export async function GET(request: NextRequest) {
  const drivers = await prisma.driver.findMany({
    include: {
      OwnerDriver:true
      },
    }
  );
 
  return NextResponse.json(drivers);
}

