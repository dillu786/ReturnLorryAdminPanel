import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { getUserPermissionCodes } from "@/db/permisssions"

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permissions = await getUserPermissionCodes(token.id as string)
    return NextResponse.json({ permissions })
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 