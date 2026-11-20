const request = require("supertest");
const app = require("../src/app");
const Lead = require("../src/models/Lead");
const { connectTestDb, clearCollection, disconnectTestDb } = require("./helpers/db");
const { registerUser, bearer } = require("./helpers/auth");

// Two users for the whole file. Signing up is slow (bcrypt), so we do it once
// and only clear the leads between tests.
let alice;
let bob;

beforeAll(async () => {
  await connectTestDb();
  alice = await registerUser(app, { name: "Alice" });
  bob = await registerUser(app, { name: "Bob" });
});
afterAll(disconnectTestDb);
beforeEach(() => clearCollection(Lead));

// Small helpers so each test reads like a sentence.
const createLead = (user, data = {}) =>
  request(app)
    .post("/api/leads")
    .set(bearer(user.token))
    .send({ name: "Ravi Kumar", email: "ravi@corp.com", source: "Referral", ...data });

const listLeads = (user, query = "") =>
  request(app).get(`/api/leads${query}`).set(bearer(user.token));

describe("authentication is required", () => {
  it.each([
    ["get", "/api/leads"],
    ["post", "/api/leads"],
    ["patch", "/api/leads/64b000000000000000000000"],
    ["delete", "/api/leads/64b000000000000000000000"],
    ["get", "/api/leads/stats"],
    ["get", "/api/leads/options"],
  ])("%s %s returns 401 without a token", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/leads/options", () => {
  it("returns the allowed statuses and sources", async () => {
    const res = await request(app).get("/api/leads/options").set(bearer(alice.token));
    expect(res.status).toBe(200);
    expect(res.body.statuses).toEqual(["New", "Contacted", "Qualified", "Lost"]);
    expect(res.body.sources).toEqual(["Website", "Referral", "LinkedIn", "Cold Call", "Event", "Other"]);
  });
});

describe("POST /api/leads (create)", () => {
  it("creates a lead with defaults: status New, empty phone and company", async () => {
    const res = await createLead(alice, { name: "  Ravi Kumar ", email: "RAVI@Corp.com" });

    expect(res.status).toBe(201);
    expect(res.body.lead).toMatchObject({
      name: "Ravi Kumar",
      email: "ravi@corp.com",
      source: "Referral",
      status: "New",
      phone: "",
      company: "",
      owner: alice.user.id,
    });
    expect(res.body.lead.id).toBeDefined();
    expect(res.body.lead).not.toHaveProperty("_id");
    expect(res.body.lead).not.toHaveProperty("__v");
  });

  it("saves every field when all are provided", async () => {
    const res = await createLead(alice, {
      phone: "+91 98765 43210",
      company: "Acme",
      status: "Qualified",
      source: "LinkedIn",
    });
    expect(res.status).toBe(201);
    expect(res.body.lead).toMatchObject({
      phone: "+91 98765 43210",
      company: "Acme",
      status: "Qualified",
      source: "LinkedIn",
    });
  });

  it("returns field-level errors for invalid input", async () => {
    const res = await createLead(alice, {
      name: "",
      email: "not-an-email",
      phone: "abc",
      source: "Carrier Pigeon",
      status: "Won",
    });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(["email", "name", "phone", "source", "status"]);
    expect(await Lead.countDocuments()).toBe(0);
  });

  it("requires name, email and source", async () => {
    const res = await request(app).post("/api/leads").set(bearer(alice.token)).send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("name");
    expect(res.body.errors).toHaveProperty("email");
    expect(res.body.errors).toHaveProperty("source");
  });

  it("rejects a duplicate email for the same user with 409", async () => {
    await createLead(alice);
    const res = await createLead(alice, { name: "Someone Else", email: "RAVI@corp.com" });
    expect(res.status).toBe(409);
    expect(res.body.errors.email).toBe("You already have a lead with this email");
  });

  it("allows the same email for a different user", async () => {
    await createLead(alice);
    const res = await createLead(bob);
    expect(res.status).toBe(201);
  });

  it("ignores an owner or _id sent in the body (mass assignment)", async () => {
    const res = await createLead(alice, { owner: bob.user.id, _id: "64b000000000000000000000" });
    expect(res.status).toBe(201);
    expect(res.body.lead.owner).toBe(alice.user.id);
    expect(res.body.lead.id).not.toBe("64b000000000000000000000");
  });
});

describe("GET /api/leads (list, search, filter)", () => {
  beforeEach(async () => {
    // Created one after another so "newest first" is predictable.
    await createLead(alice, { name: "Ravi Kumar", email: "ravi@corp.com", status: "New" });
    await createLead(alice, { name: "Meera Shah", email: "meera@corp.com", status: "Qualified" });
    await createLead(alice, { name: "Dev (Test) .*", email: "dev@corp.com", status: "Contacted" });
  });

  it("lists the user's leads, newest first, with a count", async () => {
    const res = await listLeads(alice);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect(res.body.leads.map((l) => l.name)).toEqual(["Dev (Test) .*", "Meera Shah", "Ravi Kumar"]);
  });

  it("returns an empty list for a user with no leads", async () => {
    const res = await listLeads(bob);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ leads: [], count: 0 });
  });

  it("searches names case-insensitively by part of the name", async () => {
    const res = await listLeads(alice, "?search=RAV");
    expect(res.body.leads.map((l) => l.name)).toEqual(["Ravi Kumar"]);
  });

  it("matches in the middle of a name too", async () => {
    const res = await listLeads(alice, "?search=eer");
    expect(res.body.leads.map((l) => l.name)).toEqual(["Meera Shah"]);
  });

  it("searches regex characters literally", async () => {
    const res = await listLeads(alice, `?search=${encodeURIComponent("(Test) .*")}`);
    expect(res.status).toBe(200);
    expect(res.body.leads.map((l) => l.name)).toEqual(["Dev (Test) .*"]);
  });

  it("does not crash on text that is not a valid regex", async () => {
    const res = await listLeads(alice, `?search=${encodeURIComponent("(unclosed[")}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });

  it("filters by status", async () => {
    const res = await listLeads(alice, "?status=Qualified");
    expect(res.body.leads.map((l) => l.name)).toEqual(["Meera Shah"]);
  });

  it("combines search and status filters", async () => {
    expect((await listLeads(alice, "?search=meera&status=Qualified")).body.count).toBe(1);
    expect((await listLeads(alice, "?search=meera&status=New")).body.count).toBe(0);
  });

  it("rejects an invalid status filter with 400", async () => {
    const res = await listLeads(alice, "?status=Won");
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty("status");
  });

  it("treats empty search and status as no filter", async () => {
    const res = await listLeads(alice, "?search=&status=");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
  });
});

describe("PATCH /api/leads/:id (edit)", () => {
  let lead;
  beforeEach(async () => {
    lead = (await createLead(alice, { phone: "+91 98765 43210", company: "Acme" })).body.lead;
  });

  const patch = (id, body, user = alice) =>
    request(app).patch(`/api/leads/${id}`).set(bearer(user.token)).send(body);

  it("updates the status and leaves the other fields untouched", async () => {
    const res = await patch(lead.id, { status: "Contacted" });
    expect(res.status).toBe(200);
    expect(res.body.lead).toMatchObject({
      status: "Contacted",
      name: "Ravi Kumar",
      phone: "+91 98765 43210",
      company: "Acme",
    });
  });

  it("persists the change", async () => {
    await patch(lead.id, { status: "Lost" });
    const stored = await Lead.findById(lead.id);
    expect(stored.status).toBe("Lost");
  });

  it("updates several fields at once", async () => {
    const res = await patch(lead.id, { name: "Ravi K.", company: "NewCo", source: "Event" });
    expect(res.body.lead).toMatchObject({ name: "Ravi K.", company: "NewCo", source: "Event" });
  });

  it("allows clearing the phone number with an empty string", async () => {
    const res = await patch(lead.id, { phone: "" });
    expect(res.status).toBe(200);
    expect(res.body.lead.phone).toBe("");
  });

  it("rejects an invalid status with 400", async () => {
    const res = await patch(lead.id, { status: "Won" });
    expect(res.status).toBe(400);
    expect((await Lead.findById(lead.id)).status).toBe("New");
  });

  it("rejects an empty update with 400", async () => {
    const res = await patch(lead.id, {});
    expect(res.status).toBe(400);
  });

  it("rejects changing the email to one the user already has (409)", async () => {
    await createLead(alice, { name: "Meera", email: "meera@corp.com" });
    const res = await patch(lead.id, { email: "meera@corp.com" });
    expect(res.status).toBe(409);
  });

  it("cannot reassign the owner", async () => {
    const res = await patch(lead.id, { owner: bob.user.id });
    expect(res.status).toBe(400); // the unknown field is dropped, leaving nothing to update
    expect((await Lead.findById(lead.id)).owner.toString()).toBe(alice.user.id);
  });

  it("returns 404 for a lead id that does not exist", async () => {
    const res = await patch("64b000000000000000000000", { status: "Lost" });
    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed id", async () => {
    const res = await patch("not-an-id", { status: "Lost" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid id");
  });
});

describe("DELETE /api/leads/:id", () => {
  it("deletes a lead and returns 204 with no body", async () => {
    const { lead } = (await createLead(alice)).body;
    const res = await request(app).delete(`/api/leads/${lead.id}`).set(bearer(alice.token));

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(await Lead.countDocuments()).toBe(0);
  });

  it("returns 404 when deleting the same lead again", async () => {
    const { lead } = (await createLead(alice)).body;
    await request(app).delete(`/api/leads/${lead.id}`).set(bearer(alice.token));
    const res = await request(app).delete(`/api/leads/${lead.id}`).set(bearer(alice.token));
    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed id", async () => {
    const res = await request(app).delete("/api/leads/not-an-id").set(bearer(alice.token));
    expect(res.status).toBe(400);
  });
});

describe("users can only access their own leads", () => {
  let aliceLead;
  beforeEach(async () => {
    aliceLead = (await createLead(alice, { name: "Alice Private Lead" })).body.lead;
    await createLead(bob, { name: "Bob Lead", email: "bob-lead@corp.com" });
  });

  it("lists only the caller's own leads", async () => {
    const aliceList = await listLeads(alice);
    const bobList = await listLeads(bob);
    expect(aliceList.body.leads.map((l) => l.name)).toEqual(["Alice Private Lead"]);
    expect(bobList.body.leads.map((l) => l.name)).toEqual(["Bob Lead"]);
  });

  it("search never returns another user's leads", async () => {
    const res = await listLeads(bob, "?search=Alice");
    expect(res.body.count).toBe(0);
  });

  it("another user cannot edit a lead (404, and nothing changes)", async () => {
    const res = await request(app)
      .patch(`/api/leads/${aliceLead.id}`)
      .set(bearer(bob.token))
      .send({ status: "Lost" });

    expect(res.status).toBe(404);
    expect((await Lead.findById(aliceLead.id)).status).toBe("New");
  });

  it("another user cannot delete a lead (404, and it still exists)", async () => {
    const res = await request(app).delete(`/api/leads/${aliceLead.id}`).set(bearer(bob.token));
    expect(res.status).toBe(404);
    expect(await Lead.findById(aliceLead.id)).not.toBeNull();
  });
});

describe("GET /api/leads/stats", () => {
  it("returns zero for every status when the user has no leads", async () => {
    const res = await request(app).get("/api/leads/stats").set(bearer(alice.token));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total: 0,
      byStatus: { New: 0, Contacted: 0, Qualified: 0, Lost: 0 },
    });
  });

  it("counts leads per status and in total", async () => {
    await createLead(alice, { email: "a@x.com", status: "New" });
    await createLead(alice, { email: "b@x.com", status: "New" });
    await createLead(alice, { email: "c@x.com", status: "Contacted" });
    await createLead(alice, { email: "d@x.com", status: "Lost" });

    const res = await request(app).get("/api/leads/stats").set(bearer(alice.token));
    expect(res.body).toEqual({
      total: 4,
      byStatus: { New: 2, Contacted: 1, Qualified: 0, Lost: 1 },
    });
  });

  it("only counts the caller's leads", async () => {
    await createLead(alice, { email: "a@x.com" });
    await createLead(bob, { email: "b@x.com" });
    await createLead(bob, { email: "c@x.com" });

    expect((await request(app).get("/api/leads/stats").set(bearer(alice.token))).body.total).toBe(1);
    expect((await request(app).get("/api/leads/stats").set(bearer(bob.token))).body.total).toBe(2);
  });

  it("reflects a status change made through the API", async () => {
    const { lead } = (await createLead(alice)).body;
    await request(app).patch(`/api/leads/${lead.id}`).set(bearer(alice.token)).send({ status: "Qualified" });

    const res = await request(app).get("/api/leads/stats").set(bearer(alice.token));
    expect(res.body.byStatus).toEqual({ New: 0, Contacted: 0, Qualified: 1, Lost: 0 });
  });
});
