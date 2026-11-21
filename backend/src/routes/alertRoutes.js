
import express from "express";
import {
  getAllAlerts,
  getDeviceAlerts,
  markAlertAsRead,
  deleteAlert,
} from "../controllers/alertController.js";
import { validate } from "../middleware/validate.js";
import {
  alertIdParamSchema,
  deviceIdParamSchema,
} from "../validators/alert.validators.js";

const router = express.Router();

// GET /api/alerts — Get all alerts for the logged-in user
router.get("/", getAllAlerts);

// GET /api/alerts/device/:deviceId — Get alerts for a specific device
router.get(
  "/device/:deviceId",
  validate(deviceIdParamSchema, "params"),
  getDeviceAlerts
);

// PATCH /api/alerts/:id/read — Mark an alert as read (validate :id)
router.patch(
  "/:id/read",
  validate(alertIdParamSchema, "params"),
  markAlertAsRead
);

// DELETE /api/alerts/:id — Delete an alert (validate :id)
router.delete("/:id", validate(alertIdParamSchema, "params"), deleteAlert);

export default router;
