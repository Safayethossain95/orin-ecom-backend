const mongoose = require("mongoose");
const env = require("../config/env");

const connectDatabase = async () => {
  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
};

module.exports = connectDatabase;
