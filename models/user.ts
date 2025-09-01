import mongoose, { Document, Model, Schema } from "mongoose";

interface IUser extends Document {
    id: string
    name: string;
    email: string;
    password?: string;
    createdAt: Date
    _id: mongoose.Types.ObjectId | any;
    OTP: string ;
    profileImage?: string;
}
const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    OTP: {
        type: String,
        required: false,
    },
      profileImage: {
        type: String,
        required: true
    },


},


)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;