import { connectionToDatabase } from "@/lib/mongodb";
import Subscribe from "@/models/subscriber";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import notification from "@/models/notification";




interface SubscriberItem {
  userId: mongoose.Types.ObjectId;
  date?: Date;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectionToDatabase();
  const token = await getToken({ req });
  if (!token?.id || typeof token.id !== "string") {
    return NextResponse.json({ message: "Invalid token ID" }, { status: 400 });
  }

  const subscriberId = new mongoose.Types.ObjectId(token.id);
  const authorId = new mongoose.Types.ObjectId(params.id);

  if (subscriberId.equals(authorId)) {
    return NextResponse.json({ message: "You cannot subscribe to yourself" }, { status: 400 });
  }

  try {
    // ✅ Author subscription doc
    let userSub = await Subscribe.findOne({ userId: authorId });
    if (!userSub) {
      await Subscribe.create({
        userId: authorId,
        subscriber: [{ userId: subscriberId }],
        subscriberTo: [],
      });
      userSub = await Subscribe.findOne({ userId: authorId });
    }

    // ✅ Subscriber's own doc
    let targetSub = await Subscribe.findOne({ userId: subscriberId });
    if (!targetSub) {
      await Subscribe.create({
        userId: subscriberId,
        subscriber: [],
        subscriberTo: [{ userId: authorId }],
      });
      targetSub = await Subscribe.findOne({ userId: subscriberId });
    }

    // ✅ Add author to subscriber's "subscriberTo" list
    if (!targetSub?.subscriberTo.some((s: SubscriberItem) => s.userId.equals(authorId))) {
      targetSub?.subscriberTo.push({ userId: authorId, date: new Date() });
      await targetSub?.save();
    }

    // ✅ Add subscriber to author's "subscriber" list
    if (!userSub?.subscriber.some((s: SubscriberItem) => s.userId.equals(subscriberId))) {
      userSub?.subscriber.push({ userId: subscriberId, date: new Date() });
      await userSub?.save();
    }

    // ✅ Send notification
    await notification.create({
      recevier: authorId,
      sender: subscriberId,
      type: "subscribe",
      message: `${token.name} has subscribed to you!`,
    });

    return NextResponse.json({ message: "Subscription successful" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Subscription failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    await connectionToDatabase();
    const token = await getToken({ req });
    if (!token?.id || typeof token.id !== 'string') {
        return NextResponse.json({ message: "Invalid token ID" }, { status: 400 });
    }

    const subscriberId = await new mongoose.Types.ObjectId(token.id);
    const authorId = await new mongoose.Types.ObjectId(params.id);

    if (subscriberId == authorId) {
        return NextResponse.json({ message: "you cannot subscribe yourself" }, { status: 400 })
    }
    try {
        await Subscribe.updateOne(
            { userId: subscriberId },
            { $pull: { subscriberTo: { userId: authorId } } }

        )

        await Subscribe.updateOne(
            { userId: authorId },
            { $pull: { subscriber: { userId: subscriberId } } }

        )



        return NextResponse.json({ message: "Unsubscribed successfully" }, { status: 200 });


    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "failed to unsubscibe" }, { status: 500 });

    }



}