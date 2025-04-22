import { NextResponse } from "next/server";
import { generateCSP } from "./lib/csp";

/**
 * Middleware to add security headers to all responses
 */
export function middleware(request) {
  // Get the existing response
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = {
    // Content Security Policy
    "Content-Security-Policy": generateCSP(),

    // Prevent browsers from incorrectly detecting non-scripts as scripts
    "X-Content-Type-Options": "nosniff",

    // Disable iframes from other domains embedding this site (clickjacking protection)
    "X-Frame-Options": "DENY",

    // Prevent XSS attacks - browser blocks if detects reflected XSS attack
    "X-XSS-Protection": "1; mode=block",

    // Only send the origin in referer header when staying on same origin
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Enable strict HTTPS for a period of time
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

    // Only allow downloads from same origin
    "Cross-Origin-Opener-Policy": "same-origin",

    // Control permissions for browser features
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };

  // Set the headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Specify which routes this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
