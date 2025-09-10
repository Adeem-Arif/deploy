import { connectionToDatabase } from "@/lib/mongodb";
import Blog from "@/models/blog";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectionToDatabase();
  const token = await getToken({ req });

  console.log("Token:", token);
  if (!token) {
    return NextResponse.json({ message: "your are not signIN " }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");

    // ✅ Explicit type for filter
    const filter: Record<string, unknown> = {};

    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error: unknown) {
    // ✅ Safe type narrowing
    if (error instanceof Error) {
      console.error("❌ Error fetching blogs:", error.message);
    } else {
      console.error("❌ Unknown error:", error);
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
