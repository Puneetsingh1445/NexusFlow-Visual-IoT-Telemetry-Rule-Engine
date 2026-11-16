
import express from "express";

import {
  createTelemetry,
  getDeviceTelemetry,
} from "../controllers/telemetryController.js";

const router = express.Router();

// POST: Receive sensor readings
router.post("/", createTelemetry);

// GET: Fetch readings for a device
router.get("/:deviceId", getDeviceTelemetry);

export default router;
