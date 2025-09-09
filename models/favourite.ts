import mongoose, {  Model,} from "mongoose";

interface IFavourite {
    blogId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
}
const favouriteSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Types.ObjectId,
        ref: "Blog"
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
},
    {
        timestamps: true
    }
)
const Favourite: Model<IFavourite> = mongoose.models.Favourite || mongoose.model<IFavourite>("Favourite", favouriteSchema)
export default Favourite;