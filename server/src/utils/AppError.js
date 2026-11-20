// An error we throw on purpose, carrying the HTTP status code to send back
// (400 bad input, 401 not logged in, 404 not found, 409 conflict, ...).
// Anything that is NOT an AppError is treated as an unexpected bug (500).
class AppError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    // Optional per-field messages, e.g. { email: "Enter a valid email" }
    this.errors = errors;
  }
}

module.exports = AppError;
