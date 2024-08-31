import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;

  const protectedPaths = ["/dashboard", "/settings", "/save", "/invest"];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Check if the route is protected
  if (isProtectedRoute) {
    if (!token) {
      // No token present, redirect to sign-in
      console.log("No token found, redirecting to /");
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      // Verify the JWT token
      await jwtVerify(token, secret);
    } catch (error) {
      // Token verification failed, redirect to sign-in
      console.log("Token verification failed, redirecting to /", error);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/settings", "/invest", "/save"],
};
