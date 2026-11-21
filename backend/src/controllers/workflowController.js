
/**
 * workflowController.js — Workflow CRUD operations.
 *
 * WHAT CHANGED from the original:
 * - Manual validation removed (Zod handles it via updateWorkflowSchema/createWorkflowSchema).
 * - All DB queries now include userId — users can only see/change their own workflows.
 * - updateWorkflow uses findOneAndUpdate({ _id, userId }) instead of findByIdAndUpdate().
 *   If the userId doesn't match, it returns null → 404. The user never learns it exists.
 * - deleteWorkflow uses findOneAndDelete({ _id, userId }) for the same reason.
 * - userId and deviceId are STRIPPED from the update body before writing to DB.
 *   Even if Zod rejects them (z.never), this is an extra safety layer.
 * - Device ownership is verified during createWorkflow.
 *
 * WHAT IS UNCHANGED:
 * - Workflow creation structure (name, description, deviceId, condition, action).
 * - isConditionActive is not modified here (managed by workflowEvaluator).
 */

import Workflow from "../models/Workflow.js";
import Device from "../models/Device.js";
import ApiError from "../errors/ApiError.js";

// ─────────────────────────────────────────────
// CREATE WORKFLOW
// ─────────────────────────────────────────────
export const createWorkflow = async (req, res, next) => {
  try {
    // req.body is already validated by createWorkflowSchema
    const { name, description, deviceId, condition, action, webhookUrl, isActive } = req.body;
    const userId = req.user.userId;

    // Verify the target device exists and belongs to this user
    const device = await Device.findOne({ deviceId, userId });

    if (!device) {
      return next(
        new ApiError(
          404,
          "Device not found. Make sure the device belongs to your account."
        )
      );
    }

    const workflow = await Workflow.create({
      name,
      description,
      deviceId,
      condition,
      action,
      webhookUrl: webhookUrl || null,
      isActive,
      userId, // ← ownership recorded here
    });

    return res.status(201).json({
      success: true,
      message: "Workflow created successfully",
      data: workflow,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// GET ALL WORKFLOWS (for the logged-in user only)
// ─────────────────────────────────────────────
export const getWorkflows = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const workflows = await Workflow.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: workflows.length,
      data: workflows,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// UPDATE WORKFLOW
// ─────────────────────────────────────────────
export const updateWorkflow = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const workflowId = req.params.id; // already validated as a valid ObjectId by Zod

    // Strip any fields that must never be changed via update
    // Zod's z.never() already blocks them, but we explicitly remove them
    // here as a defence-in-depth measure.
    const { userId: _u, deviceId: _d, isConditionActive: _c, ...safeUpdate } = req.body;

    // findOneAndUpdate with BOTH _id and userId:
    // - If the workflow belongs to this user → update and return the new document.
    // - If the workflow belongs to someone else → returns null → we send 404.
    // - The attacker cannot tell whether the workflow exists at all.
    const workflow = await Workflow.findOneAndUpdate(
      { _id: workflowId, userId }, // ← ownership enforced here
      safeUpdate,
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return next(new ApiError(404, "Workflow not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Workflow updated successfully",
      data: workflow,
    });

  } catch (error) {
    return next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE WORKFLOW
// ─────────────────────────────────────────────
export const deleteWorkflow = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const workflowId = req.params.id;

    // findOneAndDelete with BOTH _id and userId — same ownership protection as update
    const workflow = await Workflow.findOneAndDelete({ _id: workflowId, userId });

    if (!workflow) {
      return next(new ApiError(404, "Workflow not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Workflow deleted successfully",
    });

  } catch (error) {
    return next(error);
  }
};
