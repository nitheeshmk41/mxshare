import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing in .env.local");
}

interface MongooseConn {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as any).mongoose as MongooseConn;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "mxshare",
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
