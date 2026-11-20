// Runs before every test file, BEFORE the app is loaded.
//
// The app reads its settings from process.env. Setting them here means the
// tests never depend on a developer's local .env file, and (because dotenv
// does not overwrite values that are already set) can never pick up the real
// Atlas connection string. Tests use a throwaway in-memory MongoDB instead.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-validation";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/never-used-in-tests";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.DNS_SERVERS = "";
