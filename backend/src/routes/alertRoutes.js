
import express from "express";

import {
  getAllAlerts,
  getDeviceAlerts,
  markAlertAsRead,
  deleteAlert,
} from "../controllers/alertController.js";

const router = express.Router();

// Get all alerts
router.get("/", getAllAlerts);

// Get alerts for a specific device
router.get("/device/:deviceId", getDeviceAlerts);

// Mark alert as read
router.patch("/:id/read", markAlertAsRead);

// Delete alert
router.delete("/:id", deleteAlert);

export default router;
