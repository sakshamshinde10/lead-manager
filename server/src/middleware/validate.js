const AppError = require("../utils/AppError");

// Turns a Zod schema into Express middleware that checks req.body.
// - Valid input: req.body is replaced with the cleaned data (trimmed,
//   lowercased, unknown fields dropped) and the request moves on.
// - Invalid input: the request stops here with a 400 listing each bad
//   field, so the frontend can show the message next to the right input.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] ?? "body";
      // Keep only the first message per field
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new AppError(400, "Validation failed", errors));
  }

  req.body = result.data;
  next();
};

module.exports = validate;
