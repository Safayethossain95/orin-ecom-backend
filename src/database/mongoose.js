const mongoose = require("mongoose");
const env = require("../config/env");

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

const connectToDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("Please define the MONGO_URI environment variable.");
  }

  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    mongoose.set("strictQuery", true);
    const opts = { bufferCommands: false };
    global.mongooseCache.promise = mongoose
      .connect(env.mongoUri, opts)
      .then((m) => m.connection);
  }

  try {
    global.mongooseCache.conn = await global.mongooseCache.promise;
  } catch (err) {
    global.mongooseCache.promise = null;
    throw err;
  }

  console.log(`MongoDB connected: ${global.mongooseCache.conn.host}`);
  return global.mongooseCache.conn;
};

module.exports = connectToDatabase;
