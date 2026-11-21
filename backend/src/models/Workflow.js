
import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    // userId links this workflow to its owner
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

    webhookUrl: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Track whether the condition has already triggered (prevents duplicate actions)
    isConditionActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Workflow = mongoose.model("Workflow", workflowSchema);

export default Workflow;
