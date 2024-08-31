// app/api/contacts/remove/route.js
import { NextResponse } from "next/server";
import prisma from "@/prismaClient";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    const { contactId } = await request.json();

    // Check if the contact exists for the user
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId: userId,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Delete the contact
    await prisma.contact.delete({
      where: {
        id: contactId,
      },
    });

    return NextResponse.json({ message: "Contact removed successfully" });
  } catch (error) {
    console.error("Error removing contact:", error);
    return NextResponse.json(
      { error: "Failed to remove contact" },
      { status: 500 }
    );
  }
}
