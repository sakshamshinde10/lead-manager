const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Each test file gets its own temporary MongoDB that lives in memory and is
// thrown away afterwards, so tests are isolated and never touch real data.
let mongod;

async function connectTestDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  // Build the indexes (e.g. the unique email index) before tests rely on them.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

async function clearCollection(model) {
  await model.deleteMany({});
}

async function disconnectTestDb() {
  await mongoose.disconnect();
  await mongod.stop();
}

module.exports = { connectTestDb, clearCollection, disconnectTestDb };
