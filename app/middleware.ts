import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUserPermissionCodes } from "@/packages/db/permissions"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const session = request.cookies.get("session")?.value

  if (!session) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // In a real app, you would decode the session token and get the user ID
  // For this example, we'll assume the session is the user ID
  const userId = session

  // Get the requested path
  const path = request.nextUrl.pathname

  // Define permission requirements for different paths
  const permissionRequirements: Record<string, string> = {
    "/dashboard": "dashboard:view",
    "/users": "users:view",
    "/drivers": "drivers:view",
    "/owners": "owners:view",
    "/rides": "rides:view",
    "/documents": "documents:view",
    "/access-control": "settings:access_control",
  }

  // Check if the path requires a permission
  const requiredPermission = permissionRequirements[path]

  if (requiredPermission) {
    // Get user permissions
    const userPermissions = await getUserPermissionCodes(userId)

    // Check if the user has the required permission
    if (!userPermissions.includes(requiredPermission)) {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/drivers/:path*",
    "/owners/:path*",
    "/rides/:path*",
    "/documents/:path*",
    "/access-control/:path*",
  ],
}
