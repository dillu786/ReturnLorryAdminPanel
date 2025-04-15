import { NextResponse } from "next/server"
import { getUserPermissionCodes } from "@/packages/db/permissions"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // In a real app, you would verify that the requesting user has permission
    // to access this information

    const permissions = await getUserPermissionCodes(userId)

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    return NextResponse.json({ error: "Failed to fetch user permissions" }, { status: 500 })
  }
}
