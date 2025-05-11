import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";
export async function GET(request: NextRequest){
    const owners = await prisma.owner.findMany({
        select:{
            Name:true,
            Email:true,
            Gender:true,
            MobileNumber:true,         
        }
    })
    console.log(owners);
   return NextResponse.json(owners);
}