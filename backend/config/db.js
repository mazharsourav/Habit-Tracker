import dns from "node:dns";
import mongoose from "mongoose";

// Node picks up 127.0.0.1 as its DNS server on this machine, which refuses
// the SRV lookup that mongodb+srv:// URIs need. Use public resolvers instead.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not defined");
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};
