
import express from "express";
import { createDevice, getDevices } from "../controllers/deviceController.js";
import { validate } from "../middleware/validate.js";
import { createDeviceSchema } from "../validators/device.validators.js";

const router = express.Router();

// POST /api/devices — Register a device (validate body first)
router.post("/", validate(createDeviceSchema), createDevice);

// GET /api/devices — Get all devices belonging to the logged-in user
router.get("/", getDevices);

export default router;
