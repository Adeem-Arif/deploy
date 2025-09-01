import mongoose, {  Model} from "mongoose";

interface ISubscriber {
    subscriber: {
        userId: mongoose.Types.ObjectId;
        date: Date;
    }[];
    subscriberTo: {
        userId: mongoose.Types.ObjectId;
        date: Date;
    }[];
    userId: mongoose.Types.ObjectId
}
const subscriberSchema = new mongoose.Schema({
    subscriber: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            date: { type: Date, default: Date.now },
        },
    ],
    subscriberTo: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            date: { type: Date, default: Date.now },
        },
    ],
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    }
},
    {
        timestamps: true
    }
)
const Subscribe: Model<ISubscriber> = mongoose.models.Subscribe || mongoose.model<ISubscriber>("Subscribe", subscriberSchema)
export default Subscribe;