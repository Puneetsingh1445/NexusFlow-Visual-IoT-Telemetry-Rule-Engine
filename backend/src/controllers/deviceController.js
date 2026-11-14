
import Device from "../models/Device.js";

// Register a new IoT device
export const createDevice = async (req, res) => {
  try {
    const { name, deviceId, deviceType, location } = req.body;

    if (!name || !deviceId || !deviceType) {
      return res.status(400).json({
        success: false,
        message: "Name, deviceId and deviceType are required",
      });
    }

    const existingDevice = await Device.findOne({ deviceId });

    if (existingDevice) {
      return res.status(409).json({
        success: false,
        message: "Device ID already exists",
      });
    }

    const device = await Device.create({
      name,
      deviceId,
      deviceType,
      location,
    });

    return res.status(201).json({
      success: true,
      message: "Device registered successfully",
      data: device,
    });
  } catch (error) {
    console.error("Create device error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Device ID already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register device",
    });
  }
};

// Get all registered devices
export const getDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch devices",
    });
  }
};
