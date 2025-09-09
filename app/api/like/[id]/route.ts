import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { connectionToDatabase } from "@/lib/mongodb";
import Blog from "@/models/blog";
import notification from "@/models/notification";


export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const blogId = params.id;

  await connectionToDatabase();

  const token = await getToken({ req });
  if (
    !token ||
    !token.id ||
    !mongoose.Types.ObjectId.isValid(token.id as string)
  ) {
    return NextResponse.json(
      { message: "Unauthorized or invalid user ID" },
      { status: 401 }
    );
  }

  const userObjectId = new mongoose.Types.ObjectId(token.id as string);

  try {
    const blog = await Blog.findById(blogId).select("userId likes likesCount");
    if (!blog) {
      return NextResponse.json(
        { message: "Blog does not exist" },
        { status: 404 }
      );
    }

    // check if already liked
    const alreadyLiked = blog.likes.some((like: mongoose.Types.ObjectId) =>
      like.equals(userObjectId)
    );

    if (alreadyLiked) {
      // unlike
      blog.likes = blog.likes.filter(
        (like: mongoose.Types.ObjectId) => !like.equals(userObjectId)
      );
    } else {
      // like
      blog.likes.push(userObjectId);

      // send notification only if user is not liking their own post
      if (!blog.userId.equals(userObjectId)) {
        await notification.create({
          receiver: blog.userId,
          sender: userObjectId,
          blogId: blog._id,
          type: "like",
          seen: false,
          createdAt: new Date(),
        });
      }
    }

    blog.likesCount = blog.likes.length;
    await blog.save();

    return NextResponse.json({
      message: alreadyLiked ? "Unliked successfully" : "Liked successfully",
      likesCount: blog.likesCount, // ✅ frontend can use this
      isLike: !alreadyLiked, // ✅ toggle state for logged-in user
    });
  } catch (error) {
    console.error("Error liking blog:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
