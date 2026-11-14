
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import deviceRoutes from "./routes/deviceRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to NexusFlow Backend",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexusFlow server is running",
    status: "healthy",
  });
});

// Device APIs
app.use("/api/devices", deviceRoutes);

export default app;
