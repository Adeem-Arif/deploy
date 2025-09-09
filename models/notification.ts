import mongoose, { Schema } from "mongoose";
interface INotification {

    _id: mongoose.Types.ObjectId,
    recevier: mongoose.Types.ObjectId,
    type: "comment" | "like" | "new_post" | "subscribe" | "save",
    sender: mongoose.Types.ObjectId,
    blogId?: mongoose.Types.ObjectId,
    commentId?: mongoose.Types.ObjectId,
    seen: false,
    createdAt: Date
    tittle: string,
    message: string

}
const notificationSchema: Schema<INotification> = new mongoose.Schema({

    recevier: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    type: {
        type: String,
        enum: ['comment', 'like', 'new_post', 'subscribe', 'save'],
        required: true,
    },
    tittle: {
        type: String, // blog title, or custom string for notification
    },
    message: {
        type: String, // comment text, like description, etc.
    },
    seen: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},
    { timestamps: true }
);


export default mongoose.models.Notification ||
    mongoose.model<INotification>('Notification', notificationSchema);
