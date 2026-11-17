
import dns from "node:dns";

// Configure DNS for MongoDB Atlas
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Load environment variables
import "dotenv/config";

import http from "node:http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server using Express
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make Socket.IO available to other backend files
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP and Socket.IO server
    httpServer.listen(PORT, () => {
      console.log(`NexusFlow server running on port ${PORT}`);
      console.log("Socket.IO is ready!");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
