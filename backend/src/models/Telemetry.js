
import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    // userId links this telemetry reading to the user who owns the source device
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    temperature: {
      type: Number,
      min: -100,
      max: 200,
    },

    humidity: {
      type: Number,
      min: 0,
      max: 100,
    },

    pressure: {
      type: Number,
      min: 0,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: fast queries for a user's device telemetry in time order
telemetrySchema.index({ userId: 1, deviceId: 1, timestamp: -1 });

const Telemetry = mongoose.model("Telemetry", telemetrySchema);

export default Telemetry;
