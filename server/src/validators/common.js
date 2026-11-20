const { z } = require("zod");

// Field rules shared by several schemas (auth and leads), so "what counts as
// a valid email" is defined exactly once.

// `.trim().toLowerCase()` cleans the value first, then `.pipe(z.email())`
// checks the cleaned value is a real email.
const emailField = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

module.exports = { emailField };
