import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Copy .env.example to .env and set a MongoDB connection string.");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
}
