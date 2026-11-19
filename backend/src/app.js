
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

// Import authentication middleware
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ================================
// HOME ROUTE
// ================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to NexusFlow Backend",
  });
});

// ================================
// HEALTH CHECK ROUTE
// ================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexusFlow server is running",
    status: "healthy",
  });
});

// ================================
// AUTHENTICATION ROUTES
// ================================

// Register and Login
app.use("/api/auth", authRoutes);

// Protected route - Get logged-in user
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful!",
    user: req.user,
  });
});

// ================================
// DEVICE ROUTES
// ================================

app.use("/api/devices", deviceRoutes);

// ================================
// TELEMETRY ROUTES
// ================================

app.use("/api/telemetry", telemetryRoutes);

// ================================
// WORKFLOW ROUTES
// ================================

app.use("/api/workflows", workflowRoutes);

// ================================
// ALERT ROUTES
// ================================

app.use("/api/alerts", alertRoutes);

// ================================
// 404 - ROUTE NOT FOUND
// ================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;
