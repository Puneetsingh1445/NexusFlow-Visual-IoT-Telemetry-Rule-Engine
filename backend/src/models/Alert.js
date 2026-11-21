
import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    // userId links this alert to the user whose workflow triggered it
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deviceId: {
      type: String,
      required: true,
      trim: true,
    },

    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },

    workflowName: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
    },

    sensorData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
