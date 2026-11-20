const mongoose = require("mongoose");
const { LEAD_STATUSES, LEAD_SOURCES } = require("../constants/lead");

const leadSchema = new mongoose.Schema(
  {
    // Every lead belongs to the user who created it. This is how each
    // user only ever sees their own leads.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    // Phone and company are optional: they are often unknown at capture time.
    phone: { type: String, trim: true, maxlength: 20, default: "" },
    company: { type: String, trim: true, maxlength: 100, default: "" },

    source: { type: String, required: true, enum: LEAD_SOURCES },
    status: { type: String, required: true, enum: LEAD_STATUSES, default: "New" },
  },
  {
    timestamps: true,
    toJSON: {
      // Send clean objects to the frontend: "id" instead of "_id", no "__v".
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexes match the queries the app runs:
// - list a user's leads, newest first
leadSchema.index({ owner: 1, createdAt: -1 });
// - filter by status and count leads per status (dashboard)
leadSchema.index({ owner: 1, status: 1 });
// - stop the same user saving the same email twice
leadSchema.index({ owner: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Lead", leadSchema);
