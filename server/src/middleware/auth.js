const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/token");

// Guards a route: only requests carrying a valid login token get through.
// The client sends the token in a header:  Authorization: Bearer <token>
// On success we attach the user's id to the request, so the next handler
// knows who is asking and can load only THAT user's data.
function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    req.userId = verifyToken(token).sub;
    return next();
  } catch {
    // Expired, forged or malformed: we deliberately do not say which.
    return next(new AppError(401, "Invalid or expired token"));
  }
}

module.exports = requireAuth;
