import cloudinary, { CloudinaryUploader } from "@/lib/cloudinary";
import { connectionToDatabase } from "@/lib/mongodb";
import Blog from "@/models/blog";
import Comment from "@/models/comment";
import Favourite from "@/models/favourite";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// ✅ UPDATE blog
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectionToDatabase();
    const id = (await params).id;

    try {
        const formData = await req.formData();
        const tittle = formData.get("tittle") as string;
        const category = formData.get("category") as string;
        const content = formData.get("content") as string;
        const newImage = formData.get("image") as string | null;

        const blog = await Blog.findById(id);
        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }


        await Blog.findByIdAndUpdate(id, { tittle, content, category, image:newImage });
        return NextResponse.json({ message: "Blog updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating blog:", error);
        return NextResponse.json(
            { message: "Something went wrong", error: (error as Error).message },
            { status: 500 }
        );
    }
}
// ✅ GET single blog
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectionToDatabase();
        const id = (await params).id;

        const blog = await Blog.findById(id);

        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json({ blog }, { status: 200 });
    } catch (error: any) {
        console.error("❌ GET /blog/[id] error:", error.message || error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// ✅ DELETE blog
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectionToDatabase();

        const token = await getToken({ req });
        if (!token?.id || !mongoose.Types.ObjectId.isValid(token.id as string)) {
            return NextResponse.json({ message: "Unauthorized or invalid user ID" }, { status: 401 });
        }

        const blogId = (await params).id;
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }

        // Check ownership
        if (blog.userId.toString() !== token.id) {
            return NextResponse.json({ message: "Not authorized to delete this blog" }, { status: 403 });
        }

        await Comment.deleteMany({ blogId });
        await Favourite.deleteMany({ blogId });
        await Blog.findByIdAndDelete(blogId);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("❌ Error deleting blog:", error);
        return NextResponse.json(
            { message: "Server error", error: (error as Error).message },
            { status: 500 }
        );
    }
}
