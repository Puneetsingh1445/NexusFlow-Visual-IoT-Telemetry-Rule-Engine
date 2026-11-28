
/**
 * deviceRoutes.js — All Device CRUD routes.
 *
 * WHAT CHANGED:
 * - Added: getDeviceById, updateDevice, deleteDevice imports.
 * - Added: updateDeviceSchema import from device.validators.js.
 * - Added: mongoIdParamSchema import from alert.validators.js (already exists, reused).
 * - Added: GET /:id  — Get a single device by its MongoDB _id.
 * - Added: PUT /:id  — Update a device (validate :id param + validate body).
 * - Added: DELETE /:id — Delete a device (validate :id param).
 *
 * WHAT IS UNCHANGED:
 * - POST / — identical.
 * - GET /  — identical.
 * - All existing middleware wiring is identical.
 *
 * HOW :id VALIDATION WORKS:
 *   validate(mongoIdParamSchema, "params") checks that req.params.id is a valid
 *   24-character hex MongoDB ObjectId BEFORE the controller runs.
 *   If the caller sends /api/devices/abc → 422 (not 500 or CastError).
 */

import express from "express";
import {
  createDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
} from "../controllers/deviceController.js";
import { validate } from "../middleware/validate.js";
import { createDeviceSchema, updateDeviceSchema } from "../validators/device.validators.js";
import { mongoIdParamSchema } from "../validators/alert.validators.js";

const router = express.Router();

// POST /api/devices — Register a new device (validate body first)
router.post("/", validate(createDeviceSchema), createDevice);

// GET /api/devices — Get all devices belonging to the logged-in user
router.get("/", getDevices);

// GET /api/devices/:id — Get a single device by its MongoDB _id
// validate(mongoIdParamSchema, "params") ensures :id is a valid ObjectId before the controller runs
router.get("/:id", validate(mongoIdParamSchema, "params"), getDeviceById);

// PUT /api/devices/:id — Update a device (validate :id + validate body)
router.put(
  "/:id",
  validate(mongoIdParamSchema, "params"), // step 1: :id must be a valid ObjectId
  validate(updateDeviceSchema),           // step 2: body must have at least one valid field
  updateDevice
);

// DELETE /api/devices/:id — Delete a device (validate :id only — no body needed)
router.delete("/:id", validate(mongoIdParamSchema, "params"), deleteDevice);

export default router;
