//api/signin/route.js
import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { identifier, password } = await request.json(); // Accept either username or email as identifier
    console.log("Received login request for identifier:", identifier);

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      console.log("User not found for identifier:", identifier);
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for identifier:", identifier);
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Generated JWT token for identifier:", identifier);

    // Set the token in cookies
    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, username: user.username } },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure flag in production
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });
    console.log("Set JWT token in cookies for identifier:", identifier);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
