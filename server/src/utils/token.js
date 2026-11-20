const jwt = require("jsonwebtoken");
const env = require("../config/env");

const TOKEN_LIFETIME = "7d";
const ALGORITHM = "HS256";

// A JWT is a signed note that says "this request comes from user X".
// The server signs it with JWT_SECRET, so it can later detect any tampering
// without storing sessions in the database. "sub" (subject) is the user id.
function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: TOKEN_LIFETIME,
  });
}

// Throws if the token is expired, forged or malformed.
// We pin the algorithm so a token cannot choose a weaker one for itself.
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
}

module.exports = { signToken, verifyToken };
