const express = require("express");
const validate = require("../middleware/validate");
const requireAuth = require("../middleware/auth");
const { signupSchema, loginSchema } = require("../validators/auth");
const { signup, login, me } = require("../controllers/authController");

const router = express.Router();

// Each route reads left to right: validate input -> (guard) -> handler.
router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, me);

module.exports = router;
