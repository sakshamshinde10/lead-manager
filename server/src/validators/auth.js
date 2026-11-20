const { z } = require("zod");
const { emailField: email } = require("./common");

const name = z
  .string({ error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters");

// bcrypt only uses the first 72 bytes of a password, so we cap it there.
const newPassword = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const signupSchema = z.object({ name, email, password: newPassword });

// On login we only check the password is present. The strength rules apply
// when it is created, and we must not hint at what a valid password looks like.
const loginSchema = z.object({
  email,
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

module.exports = { signupSchema, loginSchema };
