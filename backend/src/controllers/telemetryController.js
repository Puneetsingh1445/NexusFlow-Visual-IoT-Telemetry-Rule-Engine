
import Telemetry from "../models/Telemetry.js";
import Device from "../models/Device.js";
import evaluateWorkflows from "../services/workflowEvaluator.js";

// Receive and store sensor readings
export const createTelemetry = async (req, res) => {
  try {
    const { deviceId, temperature, humidity, pressure } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    // Check whether the device exists
    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found. Register the device first.",
      });
    }

    // Require at least one sensor reading
    if (
      temperature === undefined &&
      humidity === undefined &&
      pressure === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one sensor reading is required",
      });
    }

    // Save telemetry in MongoDB
    const telemetry = await Telemetry.create({
      deviceId,
      temperature,
      humidity,
      pressure,
    });

    // Update device status
    device.lastSeen = telemetry.timestamp;
    device.status = "online";
    await device.save();

    // Automatically evaluate active workflows
    const workflowResults = await evaluateWorkflows({
      deviceId,
      temperature,
      humidity,
      pressure,
    });

    return res.status(201).json({
      success: true,
      message: "Telemetry received successfully",
      data: telemetry,
      workflowResults,
    });

  } catch (error) {
    console.error("Telemetry error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to process telemetry",
    });
  }
};

// Get telemetry for a specific device
export const getDeviceTelemetry = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const telemetry = await Telemetry.find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: telemetry.length,
      data: telemetry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch telemetry",
    });
  }
};
