const request = require("supertest");
const app = require("../src/app");

describe("health check and generic errors", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Route not found: GET /api/does-not-exist");
  });

  it("returns 400 for a request body that is not valid JSON", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ this is not json");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Request body is not valid JSON");
  });
});
