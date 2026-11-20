const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const User = require("../src/models/User");
const { connectTestDb, clearCollection, disconnectTestDb } = require("./helpers/db");
const { registerUser, bearer } = require("./helpers/auth");

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(() => clearCollection(User));

describe("POST /api/auth/signup", () => {
  it("creates an account and returns a token and the public user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "  Asha Rao ", email: " ASHA@Example.com ", password: "password123" });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user).toMatchObject({ name: "Asha Rao", email: "asha@example.com" });
    expect(res.body.user.id).toBeDefined();
  });

  it("never returns the password or its hash", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Asha", email: "asha@example.com", password: "password123" });

    const text = JSON.stringify(res.body);
    expect(text).not.toContain("passwordHash");
    expect(text).not.toContain("password123");
  });

  it("stores a bcrypt hash, not the plain password", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({ name: "Asha", email: "asha@example.com", password: "password123" });

    const stored = await User.findOne({ email: "asha@example.com" }).select("+passwordHash");
    expect(stored.passwordHash).not.toBe("password123");
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$10\$/);
  });

  it("rejects a duplicate email with 409", async () => {
    await registerUser(app, { email: "asha@example.com" });
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Other", email: "ASHA@example.com", password: "password123" });

    expect(res.status).toBe(409);
    expect(res.body.errors.email).toBe("An account with this email already exists");
  });

  it("returns field-level errors for invalid input", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "A", email: "not-an-email", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(Object.keys(res.body.errors).sort()).toEqual(["email", "name", "password"]);
  });

  it("returns errors for an empty body", async () => {
    const res = await request(app).post("/api/auth/signup").send({});
    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBe("Email is required");
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    const { credentials } = await registerUser(app);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email.toUpperCase(), password: credentials.password });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe(credentials.email);
  });

  it("rejects a wrong password with 401", async () => {
    const { credentials } = await registerUser(app);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("gives the same message for an unknown email (no account enumeration)", async () => {
    const { credentials } = await registerUser(app);
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "wrong-password" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@example.com", password: "wrong-password" });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
  });

  it("requires an email and a password", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("email");
    expect(res.body.errors).toHaveProperty("password");
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user for a valid token", async () => {
    const { token, user } = await registerUser(app);
    const res = await request(app).get("/api/auth/me").set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
  });

  it("rejects a request without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Authentication required");
  });

  it("rejects a malformed token", async () => {
    const res = await request(app).get("/api/auth/me").set(bearer("not.a.token"));
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
  });

  it("rejects an expired token", async () => {
    const { user } = await registerUser(app);
    const expired = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: -10 });
    const res = await request(app).get("/api/auth/me").set(bearer(expired));
    expect(res.status).toBe(401);
  });

  it("rejects a token signed with a different secret", async () => {
    const { user } = await registerUser(app);
    const forged = jwt.sign({ sub: user.id }, "some-other-secret-that-is-long-enough");
    const res = await request(app).get("/api/auth/me").set(bearer(forged));
    expect(res.status).toBe(401);
  });

  it("rejects an Authorization header that is not a Bearer token", async () => {
    const { token } = await registerUser(app);
    const res = await request(app).get("/api/auth/me").set("Authorization", `Token ${token}`);
    expect(res.status).toBe(401);
  });

  it("rejects a valid token whose user no longer exists", async () => {
    const { token } = await registerUser(app);
    await User.deleteMany({});
    const res = await request(app).get("/api/auth/me").set(bearer(token));
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Account no longer exists");
  });
});
