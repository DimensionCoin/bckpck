import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch transactions for the authenticated user
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" }, // Sort by most recent
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
