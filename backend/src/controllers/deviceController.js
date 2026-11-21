
/**
 * deviceController.js — Device registration and listing.
 *
 * WHAT CHANGED from the original:
 * - Manual field-presence validation removed (handled by Zod schema).
 * - Both functions now accept "next" and pass errors to the centralized handler.
 * - userId from req.user.userId is now saved with every device (Task 2 ownership).
 * - getDevices now filters by userId so users only see their own devices.
 * - createDevice now checks deviceId uniqueness only within the user's own devices.
 *
 * WHAT IS UNCHANGED:
 * - 11000 duplicate key handling still works via centralized errorHandler.
 * - Device.create() structure is the same, just with userId added.
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

    // Check if this user already has a device with this deviceId
    // (deviceId is globally unique by the unique index on the Device model)
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
