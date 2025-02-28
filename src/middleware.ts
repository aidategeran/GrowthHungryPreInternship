import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";  // Import Next.js response handling

const isPublicRoute = createRouteMatcher([
  "/auth/sign-in(.*)",
  "/auth/sign-up(.*)",
  "/api/auth/webhook(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Wait for the auth check to complete
  const { userId } = await auth();  // Await the promise

  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // If the user is not authenticated, redirect them to sign-in
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));  // Redirect to sign-in
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|json|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)).*)", // Exclude static assets
    "/api/(.*)", // Ensure middleware runs for API routes
    "/dashboard/:path*", // Protect dashboard routes
  ],
};

