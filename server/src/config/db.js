const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  // Fail after 5 seconds instead of hanging forever if MongoDB is unreachable.
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
