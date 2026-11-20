const dns = require("dns");
const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  // Atlas "mongodb+srv://" addresses need a DNS SRV lookup. On some machines
  // Node's default DNS fails this with "querySrv ECONNREFUSED" even though the
  // network is fine. Setting DNS_SERVERS (e.g. 8.8.8.8,1.1.1.1) works around it.
  if (env.DNS_SERVERS) {
    dns.setServers(env.DNS_SERVERS.split(",").map((server) => server.trim()));
  }

  // Fail after 5 seconds instead of hanging forever if MongoDB is unreachable.
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
