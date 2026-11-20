const { z } = require("zod");
const { LEAD_STATUSES, LEAD_SOURCES } = require("../constants/lead");
const { emailField } = require("./common");

// NOTE: no `.default()` anywhere in these schemas. Defaults (status "New",
// empty phone/company) are applied by the database model instead. A default
// here would silently overwrite existing values when a lead is EDITED with
// only some of its fields.

const name = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

// Optional. An empty string is allowed so the user can clear a phone number.
const phone = z
  .string()
  .trim()
  .max(20, "Phone must be at most 20 characters")
  .refine((value) => value === "" || /^\+?[\d\s\-()]{7,20}$/.test(value), {
    message: "Enter a valid phone number",
  });

const company = z.string().trim().max(100, "Company must be at most 100 characters");

const source = z.enum(LEAD_SOURCES, { error: "Choose a valid source" });
const status = z.enum(LEAD_STATUSES, { error: "Choose a valid status" });

const leadFields = {
  name,
  email: emailField,
  phone: phone.optional(),
  company: company.optional(),
  source,
  status: status.optional(),
};

// Creating: name, email and source are required.
const createLeadSchema = z.object(leadFields);

// Editing: any subset of the fields, but at least one.
// Because Zod drops unknown keys, a client can never send "owner" or "_id"
// and change who a lead belongs to (this prevents "mass assignment").
const updateLeadSchema = z
  .object(leadFields)
  .partial()
  .refine((fields) => Object.keys(fields).length > 0, {
    message: "Provide at least one field to update",
  });

// Query string for the list: /api/leads?search=ravi&status=New
// The frontend may send empty values (?status=), which we treat as "not set".
const emptyToUndefined = (value) => (value === "" ? undefined : value);

const listQuerySchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(emptyToUndefined, status.optional()),
});

module.exports = { createLeadSchema, updateLeadSchema, listQuerySchema };
