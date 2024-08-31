//api/signup/route.js
import { NextResponse } from "next/server";
import prisma from "../../../../prismaClient";
import { Keypair } from "@solana/web3.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import { encrypt } from "../../../../utils/crypto"; // Import the encrypt function

export async function POST(request) {
  try {
    const { email, username, password } = await request.json();

    // Validate email format
    if (!validator.isEmail(email)) {
      console.error("Invalid email format");
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      console.error("Password must be at least 8 characters long");
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      console.error("Email or username already exists");
      return NextResponse.json(
        { error: "Email or username already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Create Solana wallet
    const keypair = Keypair.generate();
    const walletAddress = keypair.publicKey.toString();
    const privateKey = Buffer.from(keypair.secretKey).toString("hex");
    console.log("Solana wallet generated successfully");

    // Encrypt the private key
    const encryptedPrivateKey = encrypt(privateKey);
    console.log("Private key encrypted successfully");

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        walletAddress,
        privateKey: encryptedPrivateKey.content,
        iv: encryptedPrivateKey.iv, // Storing IV for decryption
      },
    });
    console.log("User created successfully in the database");

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token in cookies
    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, username: user.username } },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
    });
    console.log("Cookie set successfully");

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
