import { NextResponse } from "next/server";
import prisma from "@/prismaClient";
import { jwtVerify } from "jose";
import cloudinary from "cloudinary";
import { Readable } from "stream";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    // Fetch the existing user data to get the current avatar URL
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // If the user already has an avatar, delete the old one from Cloudinary
    if (user?.avatarUrl) {
      const publicId = user.avatarUrl.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.v2.uploader.destroy(`avatars/${publicId}`);
    }

    // Convert file to a stream
    const stream = Readable.from(file.stream());

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: "avatars",
          width: 150,
          height: 150,
          crop: "fill",
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      stream.pipe(uploadStream);
    });

    const avatarUrl = uploadResult.secure_url;

    // Update the user's avatar URL in the database
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
