
import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    // userId links this device to its owner (the authenticated user who created it)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    deviceType: {
      type: String,
      required: true,
      enum: ["temperature", "humidity", "pressure", "other"],
    },

    location: {
      type: String,
      default: "Unknown",
    },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },

    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Device = mongoose.model("Device", deviceSchema);

export default Device;
