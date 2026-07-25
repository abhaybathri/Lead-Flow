const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4 — avoids IPv6/DNS issues on some networks
dns.setDefaultResultOrder('ipv4first');

const connectDB = async (uri) => {
  const connectionUri = uri || process.env.DATABASE_URL;

  if (!connectionUri) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const conn = await mongoose.connect(connectionUri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4,
  });

  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
