// app/api/(user)/privatekey/route.js
import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { decrypt } from "../../../../utils/crypto";

export async function GET() {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        privateKey: true,
        iv: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const decryptedPrivateKey = decrypt({
      content: user.privateKey,
      iv: user.iv,
    });

    // Ensure the private key is returned as a proper Uint8Array
    const privateKeyUint8Array = Uint8Array.from(
      Buffer.from(decryptedPrivateKey, "hex")
    );

    if (privateKeyUint8Array.length !== 64) {
      throw new Error("Invalid private key length");
    }

    return NextResponse.json({ privateKey: Array.from(privateKeyUint8Array) });
  } catch (error) {
    console.error("Error decrypting private key:", error);
    return NextResponse.json(
      { error: "Invalid token or decryption error" },
      { status: 401 }
    );
  }
}
