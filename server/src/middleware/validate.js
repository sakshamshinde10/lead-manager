const AppError = require("../utils/AppError");

// Turns a Zod schema into Express middleware.
//   validate(schema)           checks req.body
//   validate(schema, "query")  checks req.query (?search=...&status=...)
//
// - Valid input: the cleaned data (trimmed, lowercased, unknown fields
//   dropped) replaces req.body, or is placed in req.validatedQuery.
//   (Express 5 makes req.query read-only, so we cannot overwrite it.)
// - Invalid input: the request stops here with a 400 listing each bad
//   field, so the frontend can show the message next to the right input.
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] ?? source;
      // Keep only the first message per field
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new AppError(400, "Validation failed", errors));
  }

  if (source === "body") req.body = result.data;
  else req.validatedQuery = result.data;
  next();
};

module.exports = validate;
