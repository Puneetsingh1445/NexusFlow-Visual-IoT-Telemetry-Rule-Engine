import dns from "node:dns";

// Use Google DNS to avoid local resolver issues with MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Load environment variables FIRST — before any module that reads them
import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB first
    await connectDB();

    // 2. Start Express only after DB is ready
    app.listen(PORT, () => {
      console.log(`NexusFlow server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
