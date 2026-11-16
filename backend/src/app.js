
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Import API routes
import deviceRoutes from "./routes/deviceRoutes.js";
import telemetryRoutes from "./routes/telemetryRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to NexusFlow Backend",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexusFlow server is running",
    status: "healthy",
  });
});

// Device APIs
app.use("/api/devices", deviceRoutes);

// Telemetry APIs
app.use("/api/telemetry", telemetryRoutes);

// Workflow APIs
app.use("/api/workflows", workflowRoutes);

// Alert APIs
app.use("/api/alerts", alertRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;
