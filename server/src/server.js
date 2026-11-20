const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

async function start() {
  // Connect to the database first so the API never accepts requests it
  // cannot answer. If MongoDB is unreachable we exit with a clear message.
  try {
    await connectDB();
  } catch (error) {
    console.error(`Could not connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Lead Manager API listening on http://localhost:${env.PORT}`);
  });

  // Shut down cleanly when the process is asked to stop (Ctrl+C, deploys).
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start();
