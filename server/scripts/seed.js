// Fills the database with a demo account and 30 sample leads.
//
//   npm run seed
//
// Safe to run again: it only touches the demo account's own leads (it replaces
// them), and never any other user's data.
//
// Log in afterwards with:
//   email:    demo@leadmanager.test
//   password: Demo@12345

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Lead = require("../src/models/Lead");
const { buildSampleLeads } = require("./sampleLeads");

const DEMO = { name: "Demo User", email: "demo@leadmanager.test", password: "Demo@12345" };

async function seed() {
  await connectDB();

  let user = await User.findOne({ email: DEMO.email });
  if (!user) {
    user = await User.create({
      name: DEMO.name,
      email: DEMO.email,
      passwordHash: await bcrypt.hash(DEMO.password, 10),
    });
    console.log(`Created demo user ${DEMO.email}`);
  }

  await Lead.deleteMany({ owner: user._id });
  // insertMany keeps the createdAt dates we set, so the list looks lived-in.
  await Lead.insertMany(buildSampleLeads().map((lead) => ({ ...lead, owner: user._id })), {
    timestamps: false,
  });

  console.log(`Added 30 sample leads for ${DEMO.email}`);
  console.log(`Log in with  ${DEMO.email}  /  ${DEMO.password}`);
}

seed()
  .catch((error) => {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
