import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Please define the MONGO connection string in your .env file");
}

export const connectionToDatabase = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    console.log("✅ Already connected to MongoDB");
    return mongoose;
  }

  try {
    console.log("🔌 Attempting MongoDB connection...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ MongoDB connected successfully");
    return mongoose;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); 
  }
};
