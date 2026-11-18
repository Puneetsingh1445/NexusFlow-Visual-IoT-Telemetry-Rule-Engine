
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Import routes
import deviceRoutes from "./routes/deviceRoutes.js";
import telemetryRoutes from "./routes/telemetryRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Parse JSON requests
app.use(express.json());

// HTTP request logger
app.use(morgan("dev"));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to NexusFlow Backend",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexusFlow server is running",
    status: "healthy",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Device routes
app.use("/api/devices", deviceRoutes);

// Telemetry routes
app.use("/api/telemetry", telemetryRoutes);

// Workflow routes
app.use("/api/workflows", workflowRoutes);

// Alert routes
app.use("/api/alerts", alertRoutes);

// Handle unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;
