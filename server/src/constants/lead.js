// Single source of truth for the allowed lead statuses and sources.
// The model, the validation rules and the API all import these lists,
// so adding a new value later means editing one place only.

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Lost"];

const LEAD_SOURCES = ["Website", "Referral", "LinkedIn", "Cold Call", "Event", "Other"];

module.exports = { LEAD_STATUSES, LEAD_SOURCES };
