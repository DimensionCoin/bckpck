import { NextResponse } from "next/server";

export async function POST() {
  // Clear the JWT token by setting the cookie with a past expiration date
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: -1, // Expire the cookie immediately
    path: "/",
  });

  return response;
}

export async function GET() {
  // Clear the JWT token by setting the cookie with a past expiration date
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: -1, // Expire the cookie immediately
    path: "/",
  });

  return response;
}
