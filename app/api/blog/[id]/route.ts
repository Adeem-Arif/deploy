import cloudinary, { CloudinaryUploader } from "@/lib/cloudinary";
import { connectionToDatabase } from "@/lib/mongodb";
import Blog from "@/models/blog";
import Comment from "@/models/comment";
import Favourite from "@/models/favourite";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    await connectionToDatabase();
    const id = await params.id;

    try {

        const formData = await req.formData();
   
        const tittle = formData.get('tittle') as string;
        const category = formData.get('category') as string;
        const content = formData.get('content') as string;
        const newImage = formData.get("image") as File || "";
        const blog = await Blog.findById(id);
 
        if (!blog) {
            return NextResponse.json({ message: "blog does not fin " }, { status: 400 })
        }
        if (blog.image) {
            const publicId = extractPublicId(blog.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        let imageUrl: string = "";
        if (newImage) {
            try {

                imageUrl = await CloudinaryUploader(newImage,"blog-Picture") as string

            } catch (error) {
                console.error("Image upload error:", error);
                return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
            }
        }

        const updateBlog = await Blog.findByIdAndUpdate(id, { tittle, content, category, image: imageUrl });
        if (!updateBlog) {
            return NextResponse.json({ message: "Blog is not update" }, { status: 404 })
        }
        return NextResponse.json({ message: "Blog is  update successfully" }, { status: 200 })

    }
    catch (error) {
        return NextResponse.json({ message: "Something went wrong", error }, { status: 500 });
    }

}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id
    await connectionToDatabase();
    const blog = await Blog.findOne({ _id: id })
    return NextResponse.json({ blog }, { status: 200 })
}



export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {


    try {
        await connectionToDatabase();

        const token = await getToken({ req });
        if (!token || !token.id || !mongoose.Types.ObjectId.isValid(token.id as string)) {
            return NextResponse.json({ message: "Unauthorized or invalid user ID" }, { status: 401 });
        }

        const blogId = await params.id
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return NextResponse.json({ message: "Invalid Id " }, { status: 400 })
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return NextResponse.json({ message: "Blog not found" }, { status: 404 });
        }

        if (blog.image) {
            const publicId = extractPublicId(blog.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }
        await Comment.deleteMany({ blogId })
        await Favourite.deleteMany({ blogId })

        const deleteBlog = await Blog.findByIdAndDelete(blogId);
        if (!deleteBlog) {
            return NextResponse.json({ message: "blog is not deleted " }, { status: 400 })
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {

        console.error("❌ Error deleting blog:", error);
        return NextResponse.json(
            { message: "Server error", error: (error as Error).message },
            { status: 500 })
    }
}




function extractPublicId(imageUrl: string): string | null {
    try {
        const url = new URL(imageUrl);
        const parts = url.pathname.split('/');
        const publicIdWithExt = parts.slice(-2).join('/'); // e.g., blog-Picture/xyz123.jpg
        return publicIdWithExt.replace(/\.[^/.]+$/, '');    // remove .jpg or .png
    } catch {
        return null;
    }
}


