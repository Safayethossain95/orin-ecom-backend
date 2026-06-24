import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside your Vercel settings.");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and container reuse in Vercel serverless functions.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // If we already have an active connection, reuse it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is already in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Turn off buffering so errors fail fast if DB is down
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}