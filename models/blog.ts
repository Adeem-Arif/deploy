import mongoose, { Document, Model, Schema } from "mongoose";
interface IBlog extends Document {
    tittle: string;
    category: string;
    content: string;
    createdAt: Date;
    likes: mongoose.Types.ObjectId[];
    likesCount: number,
    image: string,
    userId: mongoose.Types.ObjectId
    name: string;
}

const blogSchema: Schema<IBlog> = new mongoose.Schema({
   
    tittle: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    likesCount: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }


},
    {
        timestamps: true
    }
)

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>("Blog", blogSchema);
export default Blog;