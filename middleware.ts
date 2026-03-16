import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login"

  // Get the authentication status from cookies
  const isAuthenticated = request.cookies.get("iftar_auth")?.value === "true"

  // Redirect logic
  if (!isPublicPath && !isAuthenticated) {
    // Redirect to login if trying to access a protected route without authentication
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isPublicPath && isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access public routes
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the paths that should trigger this middleware
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
}
