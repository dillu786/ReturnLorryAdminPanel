import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";

export async function GET(request: NextRequest) {
  const customers = await prisma.user.findMany({
    include: {
      Bookings:true
      },
    }
  );
 
  return NextResponse.json(customers);
}

