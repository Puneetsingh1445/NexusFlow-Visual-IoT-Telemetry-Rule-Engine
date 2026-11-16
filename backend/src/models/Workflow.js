
import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    deviceId: {
      type: String,
      required: true,
      trim: true,
    },

    condition: {
      parameter: {
        type: String,
        required: true,
        enum: ["temperature", "humidity", "pressure"],
      },
      operator: {
        type: String,
        required: true,
        enum: ["greater_than", "less_than", "equal_to"],
      },
      value: {
        type: Number,
        required: true,
      },
    },

    action: {
      type: String,
      required: true,
      enum: ["alert", "webhook"],
    },

    // Webhook destination URL
    webhookUrl: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Workflow = mongoose.model("Workflow", workflowSchema);

export default Workflow;
