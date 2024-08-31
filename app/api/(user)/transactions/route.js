// app/api/(user)/transactions/route.js
import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    const senderId = decoded.userId;

    const { transactionType, amount, message, recipientUsername } =
      await request.json();

    // Fetch the receiver's user ID using their username
    const recipient = await prisma.user.findUnique({
      where: { username: recipientUsername },
      select: { id: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const recipientId = recipient.id;

    // Create transaction for sender
    await prisma.transaction.create({
      data: {
        userId: senderId,
        transactionType: `${transactionType} out`,
        amount: parseFloat(amount),
        message,
        timestamp: new Date(),
      },
    });

    // Create transaction for recipient
    await prisma.transaction.create({
      data: {
        userId: recipientId,
        transactionType: `${transactionType} in`,
        amount: parseFloat(amount),
        message,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ message: "Transactions logged successfully" });
  } catch (error) {
    console.error("Error logging transactions:", error);
    return NextResponse.json(
      { error: "Failed to log transactions" },
      { status: 500 }
    );
  }
}
