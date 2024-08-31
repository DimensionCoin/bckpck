// app/api/contacts/add/route.js
import { NextResponse } from "next/server";
import prisma from "@/prismaClient";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Helper function to fetch wallet address by username
async function fetchWalletAddressByUsername(username) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { walletAddress: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.walletAddress;
}

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    const { contactUsername, isFavorite } = await request.json();

    // Fetch the wallet address of the contact by username
    const contactWalletAddress = await fetchWalletAddressByUsername(
      contactUsername
    );

    // Check if the contact already exists for the user
    const existingContact = await prisma.contact.findFirst({
      where: {
        userId,
        contactUsername,
      },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: "Contact already exists" },
        { status: 400 }
      );
    }

    // Create the new contact
    const newContact = await prisma.contact.create({
      data: {
        userId,
        contactUsername,
        contactWalletAddress,
        isFavorite: isFavorite || false,
      },
    });

    return NextResponse.json({ contact: newContact });
  } catch (error) {
    console.error("Error adding contact:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to add contact" },
      { status: 500 }
    );
  }
}
