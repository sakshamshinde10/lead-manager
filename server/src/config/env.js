const path = require("path");
const dotenv = require("dotenv");
const { z } = require("zod");

// Load server/.env regardless of the folder the process was started from.
dotenv.config({ path: path.join(__dirname, "..", "..", ".env"), quiet: true });

// Describe every setting the app needs. Parsing fails fast with a clear
// message at startup instead of causing confusing errors later.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  // A browser's Origin header never ends with "/", so strip one if it was typed.
  CLIENT_ORIGIN: z
    .string()
    .default("http://localhost:5173")
    .transform((value) => value.trim().replace(/\/+$/, "")),
  // Optional, comma-separated, e.g. "8.8.8.8,1.1.1.1". Only needed on networks
  // where Node's default DNS cannot resolve MongoDB Atlas "mongodb+srv" addresses.
  DNS_SERVERS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(`Invalid environment configuration:\n${problems}`);
  console.error("Copy server/.env.example to server/.env and fill in the values.");
  process.exit(1);
}

module.exports = parsed.data;
