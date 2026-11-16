
import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
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

telemetrySchema.index({ deviceId: 1, timestamp: -1 });

const Telemetry = mongoose.model("Telemetry", telemetrySchema);

export default Telemetry;
