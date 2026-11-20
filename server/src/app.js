const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");

// The Express app is built here and exported WITHOUT calling listen().
// server.js starts it. Keeping them apart lets the automated tests
// import the app and call it directly without opening a real port.
const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());

// Simple health check: lets us (and hosting platforms) confirm the API is up.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

// Anything that did not match a route above gets a clean JSON 404.
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Must be registered LAST: it catches errors thrown by everything above.
app.use(errorHandler);

module.exports = app;
