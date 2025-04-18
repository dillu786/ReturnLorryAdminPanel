import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextURL } from "next/dist/server/web/next-url"

// Define permission requirements for different paths
const permissionRequirements: Record<string, string> = {
  "/dashboard": "dashboard:view",
  "/users": "users:view",
  "/drivers": "drivers:view",
  "/owners": "owners:view",
  "/rides": "rides:view",
  "/documents": "documents:view",
  "/access-control": "access_control:view",
  "/settings":"settings:view"
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the token from the session
  const token = await getToken({ req: request })
  
  // If there's no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Get the requested path
  const path = request.nextUrl.pathname

  // Check if the path requires a permission
  const requiredPermission = permissionRequirements[path]

  if (requiredPermission) {
    try {
      // Fetch permissions from the API
      console.log("nexturl"+process.env.NEXTAUTH_URL);
      console.log("nextauth"+request.nextUrl.origin);
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/permissions`, {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch permissions")
      }

      const { permissions } = await response.json()
      console.log(permissions);
      console.log(path);
      // Check if the user has the required permission
      if (!permissions.includes(requiredPermission)) {
        // Redirect to unauthorized page
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
      // In case of error, redirect to unauthorized page
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
