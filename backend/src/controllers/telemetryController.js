
/**
 * telemetryController.js — Sensor data ingestion and retrieval.
 *
 * WHAT CHANGED from the original:
 * - Manual validation for deviceId and sensor presence removed (Zod handles it).
 * - Device lookup now also checks userId — prevents posting telemetry to
 *   another user's device.
 * - Telemetry is saved with userId for direct ownership filtering.
 * - evaluateWorkflows now receives userId so the rule engine only evaluates
 *   the authenticated user's workflows.
 * - next(error) is used instead of inline 500 responses.
 *
 * WHAT IS UNCHANGED:
 * - Device status update (lastSeen, status = "online") is identical.
 * - Socket.IO workflow evaluation pipeline is identical.
 */

import Telemetry from "../models/Telemetry.js";
import Device from "../models/Device.js";
import evaluateWorkflows from "../services/workflowEvaluator.js";
import ApiError from "../errors/ApiError.js";

// ─────────────────────────────────────────────
// CREATE TELEMETRY (Receive sensor readings)
// ─────────────────────────────────────────────
export const createTelemetry = async (req, res, next) => {
  try {
    // req.body is already validated by createTelemetrySchema
    const { deviceId, temperature, humidity, pressure } = req.body;
    const userId = req.user.userId;

    // Verify the device exists AND belongs to this user
    // This prevents User B from posting telemetry to User A's device
    const device = await Device.findOne({ deviceId, userId });

    if (!device) {
      return next(
        new ApiError(
          404,
          "Device not found. Make sure the device belongs to your account."
        )
      );
    }

    // Save telemetry — include userId for direct filtering later
    const telemetry = await Telemetry.create({
      deviceId,
      temperature,
      humidity,
      pressure,
      userId, // ← ownership recorded here
    });

    // Update the device's last-seen timestamp and online status
    device.lastSeen = telemetry.timestamp;
    device.status = "online";
    await device.save();

    // Get the Socket.IO instance attached to Express
    const io = req.app.get("io");

    // Evaluate active workflows for this device + user combination
    // Passing userId ensures workflows from other users are never triggered
    const workflowResults = await evaluateWorkflows(
      { deviceId, temperature, humidity, pressure, userId },
      io
    );

    return res.status(201).json({
      success: true,
      message: "Telemetry received successfully",
      data: telemetry,
      workflowResults,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// GET DEVICE TELEMETRY
// ─────────────────────────────────────────────
export const getDeviceTelemetry = async (req, res, next) => {
  try {
    const { deviceId } = req.params; // already validated by Zod
    const userId = req.user.userId;

    // Filter by BOTH deviceId and userId — no cross-user data leakage
    const telemetry = await Telemetry.find({ deviceId, userId })
      .sort({ timestamp: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: telemetry.length,
      data: telemetry,
    });

  } catch (error) {
    return next(error);
  }
};
