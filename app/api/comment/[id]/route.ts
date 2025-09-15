import { NextRequest, NextResponse } from "next/server";
import Comment from "@/models/comment";
import { connectionToDatabase } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import Blog from "@/models/blog";
import notification from "@/models/notification";
import User from "@/models/user";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectionToDatabase();

    const token = await getToken({ req });
    if (!token) {
        return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }

    try {
        const id = (await params).id;
        const { comment } = await req.json();
        if (!comment) {
            return NextResponse.json({ message: "invalid Comment " }, { status: 400 })
        }
        const senderUser = await User.findOne({ email: token.email });
        if (!senderUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const newComment = await Comment.create({
            blogId: id,
            name: token.name || "Anonymous",
            email: token.email,
            comment
        });
        const blog = await Blog.findById(id).select("userId")
        if (!blog || !blog.userId) {
            return NextResponse.json({ message: "Blog not found or missing userId" }, { status: 404 });
        }

        if (token.sub !== blog.userId.toString()) {
            await notification.create({
                sender: senderUser.id,
                recevier: blog.userId,
                blogId: blog._id,
                comment: newComment._id,
                type: "comment",
                seen: false,
                createat: new Date()

            })
        }


        return NextResponse.json({ message: "add commnet" }, { status: 201 })



    } catch (error) {
        console.error("Error in comment POST:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectionToDatabase();

    try {
        const id = (await params).id
        const comments = await Comment.find({ blogId: id }).sort({ createdAt: -1 })
        return NextResponse.json({ comments })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

}