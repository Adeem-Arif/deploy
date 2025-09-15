import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Blog from '@/models/blog';
import { connectionToDatabase } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { CloudinaryUploader } from "@/lib/cloudinary";
import Subscribe from "@/models/subscriber";
import notification from "@/models/notification";
import mongoose from "mongoose";


export async function GET(req: NextRequest) {
  try {
    await connectionToDatabase();

    const token = await getToken({ req });
    if (!token?.id) {
      return NextResponse.json(
        { message: "You are not signed in" },
        { status: 401 }
      );
    }

    console.log("✅ Token ID:", token.id);

    const blogs = await Blog.aggregate([
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blogId",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "favourites",
          localField: "_id",
          foreignField: "blogId",
          as: "favourites",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          userName: { $arrayElemAt: ["$user.name", 0] },
          userEmail: { $arrayElemAt: ["$user.email", 0] },
          favouriteCount: { $size: "$favourites" },
          commentCount: { $size: "$comments" },
          likesCount: { $size: "$likes" }, // ✅ directly from Blog schema
          isLike: {
            $in: [new mongoose.Types.ObjectId(token.id as string), "$likes"], // ✅ check inside blog.likes
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in blog lookup:", error);
    return NextResponse.json(
      { message: "Error fetching blogs" },
      { status: 500 }
    );
  }
}



export async function POST(req: NextRequest) {
    try {
        await connectionToDatabase();
        const token = await getToken({ req });
console.log("token",token)
        if (!token) {
            return NextResponse.json({ message: "You are not signed in" }, { status: 401 });
        }

        const { id: userId, name } = token;

        const formData = await req.formData();
        const tittle = formData.get("tittle") as string;
        const category = formData.get("category") as string;
        const content = formData.get("content") as string;
        const image = formData.get("image") as string;
console.log("formData",formData)

        if (!tittle || !content || !category || !image) {
            return NextResponse.json({ message: "Invalid field" }, { status: 400 });
        }

        // Upload image
        // let imageUrl = "";
        // try {
        //     imageUrl = await CloudinaryUploader(image, "blog-Picture") as string;
        //     console.log("imageUrl",)
        // } catch (error) {
        //     console.error("Image upload error:", error);
        //     return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
        // }

        // Create blog
        const newBlog = await Blog.create({
            tittle,
            content,
            category,
            userId,
            image,
            name: userId ? name : "Anonymous"
        });

        // Fetch subscription data
        const subscription = await Subscribe.findOne({ userId });

        if (subscription?.subscriber?.length) {
            const notifications = subscription.subscriber.map((sub) => ({
                recevier: sub.userId,
                sender: userId,
                type: "new_post",
                blogId: newBlog._id,
                tittle,
                message: `${name} just published a new post: "${tittle}"`,
                seen: false,
                createdAt: new Date()
            }));

            await notification.insertMany(notifications);
        }

        return NextResponse.json({ message: "Blog is created" }, { status: 200 });

    } catch (error) {
        console.error("Error creating blog:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}







