const AppError = require("../utils/AppError");

// The one place every error ends up. Controllers just throw; this decides
// what the client sees, so the response shape is always the same:
//   { message: "...", errors?: { field: "..." } }
// Express 5 forwards errors from async handlers here automatically,
// so we do not need try/catch or wrapper functions in every controller.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Errors we threw on purpose
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Malformed JSON in the request body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body is not valid JSON" });
  }

  // A value that cannot be an ObjectId, e.g. GET /api/leads/not-an-id
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  // Anything else is a bug. Log the details for us, but never leak them
  // (stack traces, database messages) to the client.
  console.error(err);
  return res.status(500).json({ message: "Something went wrong on our side" });
}

module.exports = errorHandler;
