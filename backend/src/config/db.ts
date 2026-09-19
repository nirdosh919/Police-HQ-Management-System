import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in .env");
  }

  try {
    await mongoose.connect(mongoUri);

    console.log("=================================");
    console.log(" MongoDB connected successfully ");
    console.log("=================================");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
