import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function CloudinaryUploader(image: File, folder: string) {
  if (!image) {
    return NextResponse.json({ message: "No image provided" }, { status: 400 });
  }

  try {
    const buffer = await image.arrayBuffer();
    const mimeType = image.type;
    const encoding = "base64";
    const base64Data = Buffer.from(buffer).toString("base64");
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;
    const imageUrl = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload(
        fileUri,
        {
          invalidate: true,
          folder: folder || "default-folder", // use provided folder, fallback to "default-folder"
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || "");
        }
      );
    });

    return imageUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
  }
}

export default cloudinary;



