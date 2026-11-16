
import Workflow from "../models/Workflow.js";
import Device from "../models/Device.js";

// CREATE WORKFLOW
export const createWorkflow = async (req, res) => {
  try {
    const { name, description, deviceId, condition, action } = req.body;

    if (!name || !deviceId || !condition || !action) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const workflow = await Workflow.create({
      name,
      description,
      deviceId,
      condition,
      action,
    });

    return res.status(201).json({
      success: true,
      message: "Workflow created successfully",
      data: workflow,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL WORKFLOWS
export const getWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: workflows.length,
      data: workflows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workflows",
    });
  }
};

// UPDATE WORKFLOW
export const updateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workflow updated successfully",
      data: workflow,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE WORKFLOW
export const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workflow deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
