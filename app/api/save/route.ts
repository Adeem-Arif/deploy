import { connectionToDatabase } from "@/lib/mongodb";
import Favourite from "@/models/favourite";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await connectionToDatabase();
    try {
        const token = await getToken({ req });
        if (!token) {
            return NextResponse.json({ message: "first signIn please" }, { status: 400 })
        }
        const favourites = await Favourite.find({ userId: token.id }).populate("blogId");
        const blogs = favourites.map(fav => fav.blogId);
       

        return NextResponse.json({ blogs }, { status: 200 })


    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch wishlist" }, { status: 500 });

    }


}