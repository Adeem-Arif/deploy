import cloudinary, { CloudinaryUploader } from "@/lib/cloudinary";
import { connectionToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = await params.id
    console.log("ID from route:", id);
    await connectionToDatabase();
    const user = await User.findOne({ _id: id })
    return NextResponse.json({ user }, { status: 200 })
}



export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectionToDatabase();
  const { id } = params;
  console.log("Updating user with ID:", id);

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const newImage = formData.get("profileImage") as File | null;

    if (!name || !password) {
      return NextResponse.json(
        { message: "Name and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 🔑 Upload new image only if provided
    let imageUrl = user.profileImage;

    if (newImage && newImage.size > 0) {
      // ✅ Only delete old image if a new one is uploaded
      if (user.profileImage) {
        const publicId = extractPublicId(user.profileImage);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      try {
        imageUrl = (await CloudinaryUploader(newImage, "update")) as string;
      } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, password: hashedPassword, profileImage: imageUrl },
      { new: true }
    );

    return NextResponse.json(
      { message: "Profile updated successfully ✅", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}


function extractPublicId(imageUrl: string): string | null {
    try {
        const url = new URL(imageUrl);
        const parts = url.pathname.split("/");
        const publicIdWithExt = parts.slice(-2).join("/");
        return publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension
    } catch {
        console.error("Invalid image URL:", imageUrl);
        return null;
    }
}
