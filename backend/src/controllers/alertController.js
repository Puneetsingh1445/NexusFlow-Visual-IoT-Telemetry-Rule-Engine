
/**
 * alertController.js — Alert read and delete operations.
 *
 * WHAT CHANGED from the original:
 * - All DB queries now include userId — users can only see/change their own alerts.
 * - markAlertAsRead uses findOneAndUpdate({ _id, userId }) — not findByIdAndUpdate().
 * - deleteAlert uses findOneAndDelete({ _id, userId }).
 * - All try/catch blocks use next(error) for the centralized error handler.
 * - :id and :deviceId params are already validated by Zod (valid format guaranteed).
 *
 * WHAT IS UNCHANGED:
 * - Alert is never created here — it's created by actionExecutor.js inside the
 *   rule engine when a workflow condition is triggered. That is preserved.
 * - Response shapes are identical to the original.
 *
 * NOTE: Alerts don't need a "create" endpoint because they are auto-generated
 * by the rule engine. We only expose read, mark-as-read, and delete.
 */

import Alert from "../models/Alert.js";
import ApiError from "../errors/ApiError.js";

// ─────────────────────────────────────────────
// GET ALL ALERTS (for the logged-in user only)
// ─────────────────────────────────────────────
export const getAllAlerts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// GET ALERTS FOR A SPECIFIC DEVICE
// ─────────────────────────────────────────────
export const getDeviceAlerts = async (req, res, next) => {
  try {
    const { deviceId } = req.params; // already validated by Zod
    const userId = req.user.userId;

    // Filter by BOTH deviceId and userId — prevents seeing another user's device alerts
    const alerts = await Alert.find({ deviceId, userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// MARK ALERT AS READ
// ─────────────────────────────────────────────
export const markAlertAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const alertId = req.params.id; // already validated as a 24-char hex ObjectId by Zod

    // findOneAndUpdate with BOTH _id and userId — ownership enforced
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      { isRead: true },
      { new: true, runValidators: true }
    );

    if (!alert) {
      return next(new ApiError(404, "Alert not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Alert marked as read",
      data: alert,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE ALERT
// ─────────────────────────────────────────────
export const deleteAlert = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const alertId = req.params.id;

    // findOneAndDelete with BOTH _id and userId — ownership enforced
    const alert = await Alert.findOneAndDelete({ _id: alertId, userId });

    if (!alert) {
      return next(new ApiError(404, "Alert not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });

  } catch (error) {
    return next(error);
  }
};
