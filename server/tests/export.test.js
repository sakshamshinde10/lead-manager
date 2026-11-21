const request = require("supertest");
const ExcelJS = require("exceljs");
const app = require("../src/app");
const Lead = require("../src/models/Lead");
const { connectTestDb, clearCollection, disconnectTestDb } = require("./helpers/db");
const { registerUser, bearer } = require("./helpers/auth");
const { buildSampleLeads } = require("../scripts/sampleLeads");
const { LEAD_STATUSES, LEAD_SOURCES } = require("../src/constants/lead");

let alice;
let bob;

beforeAll(async () => {
  await connectTestDb();
  alice = await registerUser(app, { name: "Alice" });
  bob = await registerUser(app, { name: "Bob" });
});
afterAll(disconnectTestDb);
beforeEach(() => clearCollection(Lead));

// Download the file and read it back the way Excel would.
async function download(user, query = "") {
  const res = await request(app)
    .get(`/api/leads/export${query}`)
    .set(bearer(user.token))
    .buffer(true)
    .parse((response, done) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => done(null, Buffer.concat(chunks)));
    });
  if (res.status !== 200) return { res };
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(res.body);
  return { res, workbook };
}

const seedFor = (user, leads) =>
  Lead.insertMany(
    leads.map((lead) => ({ ...lead, owner: user.user.id })),
    { timestamps: false }
  );

describe("sample data", () => {
  const leads = buildSampleLeads();

  it("has exactly 30 leads with unique emails", () => {
    expect(leads).toHaveLength(30);
    expect(new Set(leads.map((lead) => lead.email)).size).toBe(30);
  });

  it("uses every status and every source, so every screen has data", () => {
    expect(new Set(leads.map((lead) => lead.status))).toEqual(new Set(LEAD_STATUSES));
    expect(new Set(leads.map((lead) => lead.source))).toEqual(new Set(LEAD_SOURCES));
  });

  it("is accepted by the Lead model", async () => {
    await expect(seedFor(alice, leads)).resolves.toHaveLength(30);
  });
});

describe("GET /api/leads/export", () => {
  it("requires a login", async () => {
    const res = await request(app).get("/api/leads/export");
    expect(res.status).toBe(401);
  });

  it("returns an Excel file with a dated filename", async () => {
    const { res } = await download(alice);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("spreadsheetml.sheet");
    expect(res.headers["content-disposition"]).toMatch(/attachment; filename="lead-manager-leads-\d{4}-\d{2}-\d{2}\.xlsx"/);
  });

  it("has a header row and one row per lead, newest first", async () => {
    await seedFor(alice, buildSampleLeads());
    const { workbook } = await download(alice);
    const sheet = workbook.getWorksheet("Leads");

    expect(sheet.getRow(1).values.slice(1)).toEqual([
      "No.", "Name", "Email", "Phone", "Company", "Source", "Status", "Added on", "Last updated",
    ]);
    expect(sheet.rowCount).toBe(31);
    expect(sheet.getRow(2).getCell(2).value).toBe("Aarav Mehta"); // daysAgo 0
    expect(sheet.getRow(31).getCell(2).value).toBe("Zoya Qureshi"); // daysAgo 29
  });

  it("keeps phone numbers as text and leaves missing values blank", async () => {
    await seedFor(alice, buildSampleLeads());
    const { workbook } = await download(alice, "?search=Sneha");
    const row = workbook.getWorksheet("Leads").getRow(2);
    expect(row.getCell(4).value ?? "").toBe("");
    const withPhone = (await download(alice, "?search=Aarav")).workbook.getWorksheet("Leads").getRow(2);
    expect(withPhone.getCell(4).value).toBe("+91 98200 11001");
  });

  it("applies the same search and status filters as the list", async () => {
    await seedFor(alice, buildSampleLeads());
    const lost = buildSampleLeads().filter((lead) => lead.status === "Lost").length;

    const { workbook } = await download(alice, "?status=Lost");
    const sheet = workbook.getWorksheet("Leads");
    expect(sheet.rowCount).toBe(lost + 1);
    sheet.eachRow((row, number) => {
      if (number > 1) expect(row.getCell(7).value).toBe("Lost");
    });
  });

  it("only exports the signed-in user's own leads", async () => {
    await seedFor(alice, buildSampleLeads());
    const { workbook } = await download(bob);
    expect(workbook.getWorksheet("Leads").rowCount).toBe(1); // header only
  });

  it("includes a summary sheet with the right totals", async () => {
    await seedFor(alice, buildSampleLeads());
    const { workbook } = await download(alice);
    const summary = workbook.getWorksheet("Summary");

    const find = (label) => {
      let found;
      summary.eachRow((row) => {
        if (row.getCell(1).value === label) found = row.getCell(2).value;
      });
      return found;
    };
    expect(find("Total leads")).toBe(30);
    const expectedNew = buildSampleLeads().filter((lead) => lead.status === "New").length;
    expect(find("New")).toBe(expectedNew);
  });

  it("rejects an invalid status filter", async () => {
    const { res } = await download(alice, "?status=Nope");
    expect(res.status).toBe(400);
  });
});
