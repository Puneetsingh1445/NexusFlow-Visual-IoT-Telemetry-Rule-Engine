
/**
 * deviceController.js — Full Device CRUD operations.
 *
 * WHAT CHANGED from the original:
 * - Three new functions added: getDeviceById, updateDevice, deleteDevice.
 * - All new functions use { _id, userId } in every DB query to enforce ownership.
 * - updateDevice strips deviceId and userId from the update body (defence-in-depth),
 *   even though Zod's z.never() already rejects them.
 * - deleteDevice does NOT cascade-delete telemetry or workflows — per requirements.
 * - All errors go through next(error) → centralized errorHandler.
 *
 * WHAT IS UNCHANGED:
 * - createDevice is identical.
 * - getDevices is identical.
 * - 11000 duplicate key handling still works via centralized errorHandler.
 */

import Device from "../models/Device.js";
import ApiError from "../errors/ApiError.js";

// ─────────────────────────────────────────────
// CREATE DEVICE
// ─────────────────────────────────────────────
export const createDevice = async (req, res, next) => {
  try {
    // req.body is already validated and cleaned by Zod (createDeviceSchema)
    const { name, deviceId, deviceType, location } = req.body;

    // userId comes from the verified JWT — NEVER from req.body
    const userId = req.user.userId;

    // Check if a device with this deviceId already exists globally
    // (deviceId has a globally unique index on the Device model)
    const existingDevice = await Device.findOne({ deviceId });

    if (existingDevice) {
      return next(new ApiError(409, "A device with this Device ID already exists"));
    }

    const device = await Device.create({
      name,
      deviceId,
      deviceType,
      location,
      userId, // ← ownership recorded here
    });

    return res.status(201).json({
      success: true,
      message: "Device registered successfully",
      data: device,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// GET ALL DEVICES (for the logged-in user only)
// ─────────────────────────────────────────────
export const getDevices = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Filter by userId — users can only see their own devices
    const devices = await Device.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// GET DEVICE BY MONGODB _id
// ─────────────────────────────────────────────
export const getDeviceById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deviceMongoId = req.params.id; // validated as 24-char hex by Zod

    // Query with BOTH _id and userId:
    // - If the device exists and belongs to this user → return it.
    // - If _id doesn't exist OR belongs to another user → returns null → 404.
    // The caller cannot tell whether the device exists at all.
    const device = await Device.findOne({ _id: deviceMongoId, userId });

    if (!device) {
      return next(new ApiError(404, "Device not found"));
    }

    return res.status(200).json({
      success: true,
      data: device,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// UPDATE DEVICE
// ─────────────────────────────────────────────
export const updateDevice = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deviceMongoId = req.params.id; // validated as 24-char hex by Zod

    // Strip any fields that must never be changed via update.
    // Zod's z.never() already blocks deviceId and userId from req.body,
    // but we explicitly remove them here as a defence-in-depth measure.
    const { deviceId: _d, userId: _u, ...safeUpdate } = req.body;

    // findOneAndUpdate with BOTH _id and userId:
    // - Matches → updates and returns the new document.
    // - No match (wrong id OR wrong owner) → returns null → 404.
    const device = await Device.findOneAndUpdate(
      { _id: deviceMongoId, userId }, // ← ownership enforced here
      safeUpdate,
      {
        new: true,          // return the updated document, not the old one
        runValidators: true, // run Mongoose schema validators on the update
      }
    );

    if (!device) {
      return next(new ApiError(404, "Device not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Device updated successfully",
      data: device,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE DEVICE
// ─────────────────────────────────────────────
export const deleteDevice = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deviceMongoId = req.params.id; // validated as 24-char hex by Zod

    // findOneAndDelete with BOTH _id and userId — same ownership protection as update.
    // Associated Telemetry and Workflow documents are intentionally NOT deleted.
    // Per requirements: do not cascade-delete related data.
    const device = await Device.findOneAndDelete({ _id: deviceMongoId, userId });

    if (!device) {
      return next(new ApiError(404, "Device not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Device deleted successfully",
    });

  } catch (error) {
    return next(error);
  }
};
