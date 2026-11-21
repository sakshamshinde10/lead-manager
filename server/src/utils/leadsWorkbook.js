const ExcelJS = require("exceljs");
const { LEAD_STATUSES, LEAD_SOURCES } = require("../constants/lead");

// Builds the Excel file a user downloads. Two sheets:
//   "Leads"    one row per lead, with filters and a frozen header
//   "Summary"  how many leads per status and per source
// Colours match the app's status badges so the file looks familiar.

const INK = "FF2A1B14";
const CREAM = "FFFFF4E5";
const STATUS_FILL = {
  New: "FFE9D2B6",
  Contacted: "FFFFD9C7",
  Qualified: "FFFF5A34",
  Lost: "FFD9D9D9",
};

const thinBorder = { style: "thin", color: { argb: "FFE9D2B6" } };
const allBorders = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };

function styleHeader(row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFBF5" }, name: "Calibri", size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
}

// `leads` are plain objects (Mongoose documents work too). Returns a Buffer.
async function buildLeadsWorkbook(leads, { exportedBy = "", filters = {} } = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Lead Manager";
  workbook.created = new Date();

  // ---- Leads sheet ----
  const sheet = workbook.addWorksheet("Leads", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [
    { header: "No.", key: "no", width: 6 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 34 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Company", key: "company", width: 26 },
    { header: "Source", key: "source", width: 13 },
    { header: "Status", key: "status", width: 13 },
    { header: "Added on", key: "createdAt", width: 14, style: { numFmt: "dd mmm yyyy" } },
    { header: "Last updated", key: "updatedAt", width: 14, style: { numFmt: "dd mmm yyyy" } },
  ];
  styleHeader(sheet.getRow(1));

  leads.forEach((lead, index) => {
    const row = sheet.addRow({
      no: index + 1,
      name: lead.name,
      email: lead.email,
      // Stored as text so Excel never turns "+91 98200 11001" into a number.
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source,
      status: lead.status,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    });
    row.getCell("phone").numFmt = "@";
    row.eachCell((cell) => {
      cell.border = allBorders;
      cell.alignment = { vertical: "middle" };
    });
    const status = row.getCell("status");
    status.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STATUS_FILL[lead.status] ?? CREAM } };
    status.font = { bold: true, color: { argb: INK } };
  });

  sheet.autoFilter = { from: "A1", to: { row: 1, column: sheet.columns.length } };

  // ---- Summary sheet ----
  const summary = workbook.addWorksheet("Summary");
  summary.columns = [
    { width: 26 },
    { width: 12 },
    { width: 12 },
  ];

  const title = summary.addRow(["Lead Manager export"]);
  title.font = { bold: true, size: 16, color: { argb: INK } };
  summary.addRow(["Exported on", new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })]);
  if (exportedBy) summary.addRow(["Account", exportedBy]);
  const filterText = [filters.status && `status: ${filters.status}`, filters.search && `name contains "${filters.search}"`]
    .filter(Boolean)
    .join(", ");
  summary.addRow(["Filters applied", filterText || "None (all leads)"]);
  summary.addRow(["Total leads", leads.length]).font = { bold: true };
  summary.addRow([]);

  const section = (heading, labels, key) => {
    styleHeader(summary.addRow([heading, "Leads", "Share"]));
    labels.forEach((label) => {
      const count = leads.filter((lead) => lead[key] === label).length;
      const row = summary.addRow([label, count, leads.length ? count / leads.length : 0]);
      row.getCell(3).numFmt = "0%";
      row.eachCell((cell) => (cell.border = allBorders));
    });
    summary.addRow([]);
  };
  section("Status", LEAD_STATUSES, "status");
  section("Source", LEAD_SOURCES, "source");

  return workbook.xlsx.writeBuffer();
}

module.exports = { buildLeadsWorkbook };
