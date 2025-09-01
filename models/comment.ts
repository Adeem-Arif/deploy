import mongoose, { Document, Model, Schema } from "mongoose";

interface IComment extends Document {

    comment: string
    createdAt: Date;
    blogId: mongoose.Schema.Types.ObjectId,
    name: string,
    email: string,
    commentCount:number
}
const commentSchema: Schema<IComment> = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },

    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },

    comment: {
        type: String,
        required: true
    },
    commentCount:{
        type:Number,
        default: 0
    }
    

},

    {
        timestamps: true
    }

)
const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema)
export default Comment