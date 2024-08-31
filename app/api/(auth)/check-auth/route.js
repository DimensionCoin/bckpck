// app/api/(auth)/check-auth/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/prismaClient"; // Adjust import path as necessary

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { kycVerification: true }, // Include KYC information
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Calculate the user's age based on date of birth
    let age = null;
    if (user.kycVerification?.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(user.kycVerification.dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
    }

    return NextResponse.json({
      authenticated: true,
      username: user.username,
      walletAddress: user.walletAddress,
      firstName: user.kycVerification?.firstName || null,
      lastName: user.kycVerification?.lastName || null,
      createdAt: user.createdAt, // Include the createdAt field
      avatarUrl: user.avatarUrl || null, // Include the avatarUrl field
      age,
    });
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
