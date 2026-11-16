
import Alert from "../models/Alert.js";

// GET ALL ALERTS
export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error("Fetch alerts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
    });
  }
};

// GET ALERTS FOR A SPECIFIC DEVICE
export const getDeviceAlerts = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const alerts = await Alert.find({ deviceId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error("Device alerts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch device alerts",
    });
  }
};

// MARK ALERT AS READ
export const markAlertAsRead = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alert marked as read",
      data: alert,
    });
  } catch (error) {
    console.error("Mark alert error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Failed to update alert",
    });
  }
};

// DELETE ALERT
export const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Delete alert error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Failed to delete alert",
    });
  }
};
