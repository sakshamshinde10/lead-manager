const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signToken } = require("../utils/token");
const { isDuplicateKeyError } = require("../utils/mongoErrors");

// Cost factor: each +1 doubles the hashing time. 10 is the common default,
// slow enough to make guessing passwords expensive, fast enough for users.
const SALT_ROUNDS = 10;

// A real hash of a throwaway string. On login with an unknown email we still
// run a comparison against it, so "unknown email" and "wrong password" take
// the same time and an attacker cannot use timing to discover valid emails.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

// What both signup and login return: a token plus the public user fields.
const authResponse = (user) => ({ token: signToken(user._id), user });

// POST /api/auth/signup
async function signup(req, res) {
  const { name, email, password } = req.body; // already validated and cleaned
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await User.create({ name, email, passwordHash });
    return res.status(201).json(authResponse(user));
  } catch (err) {
    // The unique index on email is the real guard. Checking "does it exist?"
    // first would be racy: two simultaneous signups could both pass the check.
    if (isDuplicateKeyError(err)) {
      throw new AppError(409, "An account with this email already exists", {
        email: "An account with this email already exists",
      });
    }
    throw err;
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  // passwordHash is hidden by default, so we ask for it explicitly here.
  const user = await User.findOne({ email }).select("+passwordHash");
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  // Same message for "no such user" and "wrong password" on purpose.
  if (!user || !passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  return res.json(authResponse(user));
}

// GET /api/auth/me   (protected)
// Lets the frontend restore the logged-in user after a page refresh.
async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError(401, "Account no longer exists");
  return res.json({ user });
}

module.exports = { signup, login, me };
