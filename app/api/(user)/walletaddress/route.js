// app/api/(user)/walletaddress/route.js
import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";
export async function POST(request) {
  try {
    const { username } = await request.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ walletAddress: user.walletAddress });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
