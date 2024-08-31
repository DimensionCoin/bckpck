import { NextResponse } from "next/server";
import prisma from "@/prismaClient"; // Adjust import path as necessary
import { jwtVerify } from "jose";
import { encrypt } from "@/utils/crypto"; // Adjust import path as necessary

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    // Extract and verify the JWT token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    // Parse the request body
    const data = await request.json();

    // Encrypt SSN/SIN before storing it
    let encryptedSSNOrSIN = null;
    if (data.ssnOrSin) {
      const encryptedData = encrypt(data.ssnOrSin);
      encryptedSSNOrSIN = JSON.stringify(encryptedData);
    }

    // Check if the user already has KYC data
    const existingKYC = await prisma.kYCVerification.findUnique({
      where: { userId },
    });

    const kycData = {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: new Date(data.dateOfBirth),
      phoneNumber: data.phoneNumber,
      address: data.address,
      city: data.city,
      stateOrProvince: data.stateOrProvince,
      postalOrZipCode: data.postalOrZipCode, // Unified field
      country: data.country,
      ssnOrSin: encryptedSSNOrSIN,
    };

    if (!existingKYC) {
      // If KYC record doesn't exist, create it
      await prisma.kYCVerification.create({
        data: kycData,
      });
    } else {
      // If KYC record exists, update it
      await prisma.kYCVerification.update({
        where: { userId },
        data: kycData,
      });
    }

    return NextResponse.json({
      message: "KYC information updated successfully",
    });
  } catch (error) {
    console.error("Error updating KYC information:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
