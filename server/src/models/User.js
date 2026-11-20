const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    // Emails are stored lowercase and must be unique, so "A@x.com" and
    // "a@x.com" cannot become two different accounts.
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    // We never store the real password, only its bcrypt hash.
    // select:false keeps it out of query results unless asked for explicitly.
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
