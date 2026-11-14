
import express from "express";
import {
  createDevice,
  getDevices,
} from "../controllers/deviceController.js";

const router = express.Router();

// POST /api/devices - Register a device
router.post("/", createDevice);

// GET /api/devices - Get all devices
router.get("/", getDevices);

export default router;
