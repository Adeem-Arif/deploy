import { connectionToDatabase } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import Notification from "@/models/notification";
import mongoose from "mongoose";
import notification from "@/models/notification";

export async function GET(req: NextRequest) {
    await connectionToDatabase();
    const token = await getToken({ req });

    if (!token || !token.id) {
        return NextResponse.json({ message: "First sign in please" }, { status: 400 });
    }

    try {
        const userId = new mongoose.Types.ObjectId(token.id as string);
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const notifications = await Notification.aggregate([
            {
                $match: {
                    recevier: userId, // matches your schema spelling!
                    createdAt: { $gte: twoDaysAgo }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        { $project: { name: 1, _id: 0 } }
                    ]
                }
            },
            { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "blogs",
                    localField: "blogId",
                    foreignField: "_id",
                    as: "blog",
                    pipeline: [
                        { $project: { tittle: 1, content: 1 } }
                    ]
                }
            },
            { $unwind: { path: "$blog", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "comments",
                    localField: "comment",
                    foreignField: "_id",
                    as: "comment",
                    pipeline: [
                        { $project: { content: 1 } } // Adjust to your actual field name
                    ]
                }
            },
            { $unwind: { path: "$comment", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "favourites",
                    localField: "favourite",
                    foreignField: "_id",
                    as: "favourite",
                    pipeline: [
                        { $project: { content: 1 } }
                    ]
                }
            },
            { $unwind: { path: "$favourite", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    senderName: "$sender.name",
                    blogTitle: "$blog.tittle",
                    blogSnippet: { $substr: ["$blogInfo.content", 0, 100] },
                    commentName: "$comment.name",
                    comment: "$comment"
                }
            },
            {
                $project: {
                    senderInfo: 0,
                    blogInfo: 0,
                    commentInfo: 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]);


        return NextResponse.json({ notifications });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error fetching notifications" ,error}, { status: 500 });
    }
}

export async function PUT() {
    try {
        await connectionToDatabase();
        // Update all unread notifications for the logged-in user
        await notification.updateMany(
            { read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to mark as read" }, { status: 500 });
    }
}


