
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
// HEALTH CHECK ROUTE  (public — no auth required)
// ================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexusFlow server is running",
    status: "healthy",
  });
});

// ================================
// AUTHENTICATION ROUTES  (public — no auth required)
// POST /api/auth/register  → register a new user
// POST /api/auth/login     → login and receive a JWT
// ================================

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
// DEVICE ROUTES  (protected — valid JWT required)
// ================================

// authMiddleware is passed as the second argument.
// Express will run it BEFORE deviceRoutes on every request to /api/devices.
// If the token is missing or invalid → 401 is returned immediately.
// If the token is valid → req.user is populated and deviceRoutes handles the request.
app.use("/api/devices", authMiddleware, deviceRoutes);

// ================================
// TELEMETRY ROUTES  (protected — valid JWT required)
// ================================

app.use("/api/telemetry", authMiddleware, telemetryRoutes);

// ================================
// WORKFLOW ROUTES  (protected — valid JWT required)
// ================================

app.use("/api/workflows", authMiddleware, workflowRoutes);

// ================================
// ALERT ROUTES  (protected — valid JWT required)
// ================================

app.use("/api/alerts", authMiddleware, alertRoutes);

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
