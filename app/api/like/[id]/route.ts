import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import Blog from "@/models/blog";
import { connectionToDatabase } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import * as mongoose from "mongoose";
import notification from "@/models/notification";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const blogId = await params.id;

    await connectionToDatabase();

    const token = await getToken({ req });
    if (!token || !token.id || !mongoose.Types.ObjectId.isValid(token.id as string)) {

        return NextResponse.json({ message: "Unauthorized or invalid user ID" }, { status: 401 });
    }


    const userObjectId = new mongoose.Types.ObjectId(token.id as string);

    try {
        const blog = await Blog.findById(blogId).select("userId likes likeCount");
        if (!blog) {
            return NextResponse.json({ message: "Blog does not exist" }, { status: 404 });
        }

        const alreadyLiked = blog.likes.some((like: mongoose.Types.ObjectId) =>
            like.equals(userObjectId)
        );

        if (alreadyLiked) {
            blog.likes = blog.likes.filter((like: mongoose.Types.ObjectId) =>
                !like.equals(userObjectId)
            );
        } else {
            blog.likes.push(userObjectId);
        }
        if (!blog.userId.equals(userObjectId)) {
            await notification.create({
                recevier: blog.userId,
                sender: token.sub,
                blogId: blog._id,
                type: "like",
                seen: false,
                createat: new Date()
            })
        }




        blog.likesCount = blog.likes.length;
        await blog.save();


        return NextResponse.json({
            message: alreadyLiked ? "Unliked successfully" : "Liked successfully",
            likes: blog.likesCount,
            isLiked: !alreadyLiked
        });


    } catch (error) {
        console.error("Error liking blog:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
