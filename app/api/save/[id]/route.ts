import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Favourite from "@/models/favourite";
import Blog from "@/models/blog";
import { connectionToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import User from "@/models/user";
import notification from "@/models/notification";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;

    await connectionToDatabase();

    const token = await getToken({ req });
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const blog = await Blog.findById(id).select("userId");
    if (!blog || !blog.userId) {
        return NextResponse.json({ message: "Blog not found or missing userId" }, { status: 404 });
    }

    const exists = await Favourite.findOne({ blogId: blog._id, userId: token.id });
    if (exists) {
        return NextResponse.json({ message: "Already saved" }, { status: 400 });
    }

    const senderUser = await User.findOne({ email: token.email });
    if (!senderUser) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const saved = await Favourite.create({
        blogId: blog._id,
        userId: token.id
    });

    if (token.sub !== blog.userId.toString()) {
        await notification.create({
            sender: new mongoose.Types.ObjectId(senderUser._id as string),
            recevier: new mongoose.Types.ObjectId(blog.userId),
            blogId: new mongoose.Types.ObjectId(blog._id as string),
            type: "save",
            seen: false
        });
    }

    return NextResponse.json({ message: "Saved successfully", blog: saved }, { status: 201 });
}


export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    await connectionToDatabase();

    const { id } = context.params;
    const token = await getToken({ req });

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const blogId = new mongoose.Types.ObjectId(id);
        const userId = new mongoose.Types.ObjectId(token.id as string);

        const deleted = await Favourite.findOneAndDelete({ blogId, userId });

        if (!deleted) {
            return NextResponse.json({ message: "Favourite not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Removed from wishlist", favourite: deleted }, { status: 200 });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return NextResponse.json({ message: "Failed to remove from wishlist" }, { status: 500 });
    }
}
