const env = require("./config/env");
const app = require("./app");

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
