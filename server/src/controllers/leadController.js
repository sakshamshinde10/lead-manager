const mongoose = require("mongoose");
const Lead = require("../models/Lead");
const User = require("../models/User");
const { buildLeadsWorkbook } = require("../utils/leadsWorkbook");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");
const { isDuplicateKeyError } = require("../utils/mongoErrors");
const { LEAD_STATUSES, LEAD_SOURCES } = require("../constants/lead");

// SECURITY RULE for this whole file: every query includes `owner: req.userId`.
// That is what stops one user from reading, editing or deleting another
// user's leads, even if they guess a valid lead id.

const duplicateEmailError = () =>
  new AppError(409, "You already have a lead with this email", {
    email: "You already have a lead with this email",
  });

// If the lead does not exist OR belongs to someone else we answer 404 in both
// cases. A 403 ("forbidden") would confirm that the id exists.
const leadNotFound = () => new AppError(404, "Lead not found");

// GET /api/leads/options
// The dropdown values live on the server, so the frontend never has its own
// copy that could drift out of date.
function options(req, res) {
  res.json({ statuses: LEAD_STATUSES, sources: LEAD_SOURCES });
}

// The search and status filter shared by the list and the Excel export, so
// both always agree on which leads match.
function buildFilter(userId, { search, status }) {
  const filter = { owner: userId };
  if (status) filter.status = status;
  // Case-insensitive "contains" match on the name, with the user's text
  // escaped so it is searched literally and not treated as a pattern.
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
  return filter;
}

// GET /api/leads?search=ravi&status=New
async function list(req, res) {
  const filter = buildFilter(req.userId, req.validatedQuery);

  // Newest first. The index on (owner, createdAt) serves this query.
  const leads = await Lead.find(filter).sort({ createdAt: -1, _id: -1 });
  res.json({ leads, count: leads.length });
}

// GET /api/leads/export?search=&status=   ->  an .xlsx file
// Same filters as the list, so "Export" downloads what the user is looking at.
async function exportLeads(req, res) {
  const query = req.validatedQuery;
  const [leads, user] = await Promise.all([
    Lead.find(buildFilter(req.userId, query)).sort({ createdAt: -1, _id: -1 }).lean(),
    User.findById(req.userId).select("email").lean(),
  ]);

  const file = await buildLeadsWorkbook(leads, { exportedBy: user?.email, filters: query });
  const day = new Date().toISOString().slice(0, 10);

  res.set({
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="lead-manager-leads-${day}.xlsx"`,
  });
  res.send(Buffer.from(file));
}

// POST /api/leads
async function create(req, res) {
  try {
    // owner always comes from the verified token, never from the request body.
    const lead = await Lead.create({ ...req.body, owner: req.userId });
    return res.status(201).json({ lead });
  } catch (err) {
    if (isDuplicateKeyError(err)) throw duplicateEmailError();
    throw err;
  }
}

// PATCH /api/leads/:id   (send only the fields that changed)
async function update(req, res) {
  let lead;
  try {
    lead = await Lead.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, req.body, {
      returnDocument: "after", // return the updated lead, not the old one
      runValidators: true, // re-check the enum rules on update
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) throw duplicateEmailError();
    throw err;
  }

  if (!lead) throw leadNotFound();
  return res.json({ lead });
}

// DELETE /api/leads/:id
async function remove(req, res) {
  const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!lead) throw leadNotFound();
  // 204 = success with nothing to send back
  return res.status(204).send();
}

// GET /api/leads/stats  ->  { total: 6, byStatus: { New: 3, Contacted: 1, ... } }
async function stats(req, res) {
  // aggregate() does NOT convert strings to ObjectIds like find() does,
  // so we convert the id from the token ourselves.
  const rows = await Lead.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Start every status at 0 so the response always has all four keys.
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0]));
  let total = 0;
  for (const { _id, count } of rows) {
    byStatus[_id] = count;
    total += count;
  }

  res.json({ total, byStatus });
}

module.exports = { options, list, exportLeads, create, update, remove, stats };
