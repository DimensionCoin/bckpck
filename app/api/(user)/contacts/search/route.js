// app/api/contacts/search/route.js
import { NextResponse } from "next/server";
import prisma from "@/prismaClient";

export async function POST(request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { message: "Username is required" },
        { status: 400 }
      );
    }

    // Find contacts for the user based on the username provided
    const contacts = await prisma.contact.findMany({
      where: {
        user: {
          username: username,
        },
      },
      include: {
        user: true, // Include user details related to the contact
      },
    });

    // Map contacts to include avatarUrl from the User model of the contact
    const contactsWithAvatar = await Promise.all(
      contacts.map(async (contact) => {
        const contactUser = await prisma.user.findUnique({
          where: { username: contact.contactUsername },
          select: { avatarUrl: true },
        });
        return {
          ...contact,
          avatarUrl: contactUser?.avatarUrl || null,
        };
      })
    );

    if (contactsWithAvatar.length === 0) {
      return NextResponse.json(
        { message: "No contacts found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contacts: contactsWithAvatar }, { status: 200 });
  } catch (error) {
    console.error("Error searching contacts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
