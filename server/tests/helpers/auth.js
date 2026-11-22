const request = require("supertest");

let counter = 0;

// Creates a user through the real signup endpoint and returns what a test
// needs: the login token, the user, and the credentials that were used.
async function registerUser(app, overrides = {}) {
  counter += 1;
  const credentials = {
    name: "Test User",
    email: `user${counter}@example.com`,
    password: "Password@123",
    ...overrides,
  };
  const res = await request(app).post("/api/auth/signup").send(credentials);
  return { token: res.body.token, user: res.body.user, credentials };
}

// Header object for authenticated requests: .set(bearer(token))
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { registerUser, bearer };
