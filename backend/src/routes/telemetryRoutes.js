
import express from "express";
import { createTelemetry, getDeviceTelemetry } from "../controllers/telemetryController.js";
import { validate } from "../middleware/validate.js";
import { createTelemetrySchema } from "../validators/telemetry.validators.js";
import { deviceIdParamSchema } from "../validators/alert.validators.js";

const router = express.Router();

// POST /api/telemetry — Receive sensor readings (validate body first)
router.post("/", validate(createTelemetrySchema), createTelemetry);

// GET /api/telemetry/:deviceId — Fetch readings for a specific device
// validate(deviceIdParamSchema, "params") validates the :deviceId URL segment
router.get("/:deviceId", validate(deviceIdParamSchema, "params"), getDeviceTelemetry);

export default router;
