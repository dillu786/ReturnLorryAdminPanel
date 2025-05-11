import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";
export async function GET(request: NextRequest){
    const rides = await prisma.bookings.findMany({
        select:{
            Driver:{
                select:{
                    Name:true
                }
            },
            User:{
                select:{
                    Name:true
                }
            },
            Vehicle:{
                select: {
                    Model:true
                }
            },
            Status:true,
            Fare: true,
            Distance: true,
            CreatedDateTime:true

        }
    })
    console.log(rides);
   return NextResponse.json(rides);
}