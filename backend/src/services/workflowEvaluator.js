
/**
 * workflowEvaluator.js — Evaluates active workflows when telemetry arrives.
 *
 * WHAT CHANGED from the original:
 * - The "reading" object now carries a userId field (passed from telemetryController).
 * - The Workflow.find() query now includes userId — only the device owner's
 *   workflows are evaluated. This prevents User B's workflows from being
 *   triggered by User A's telemetry, even if they share the same deviceId string.
 *
 * WHAT IS UNCHANGED:
 * - The entire evaluation loop, condition matching, isConditionActive deduplication,
 *   and executeAction call are identical to the original.
 */

import Workflow from "../models/Workflow.js";
import evaluateCondition from "./ruleEngine.js";
import executeAction from "./actionExecutor.js";

const evaluateWorkflows = async (reading, io = null) => {
  try {
    // reading now contains: { deviceId, temperature, humidity, pressure, userId }
    const workflows = await Workflow.find({
      deviceId: reading.deviceId,
      userId: reading.userId, // ← only evaluate this user's workflows
      isActive: true,
    });

    const results = [];

    for (const workflow of workflows) {
      const matched = evaluateCondition(reading, workflow.condition);

      // CONDITION IS TRUE
      if (matched) {
        // Skip duplicate execution if condition is already flagged as active
        if (workflow.isConditionActive) {
          results.push({
            workflowId: workflow._id,
            workflowName: workflow.name,
            matched: true,
            action: workflow.action,
            executed: false,
            message: "Condition already active. Duplicate action skipped.",
          });

          continue;
        }

        // Mark condition as active to prevent duplicate triggers
        workflow.isConditionActive = true;
        await workflow.save();

        // Execute the configured action (alert or webhook)
        const execution = await executeAction(workflow, reading, io);

        results.push({
          workflowId: workflow._id,
          workflowName: workflow.name,
          matched: true,
          action: workflow.action,
          executed: true,
          execution,
        });
      }

      // CONDITION IS FALSE: reset the active flag so it can trigger again later
      else {
        if (workflow.isConditionActive) {
          workflow.isConditionActive = false;
          await workflow.save();
        }

        results.push({
          workflowId: workflow._id,
          workflowName: workflow.name,
          matched: false,
          action: null,
          executed: false,
          message: "Condition not matched. Workflow reset.",
        });
      }
    }

    return results;

  } catch (error) {
    console.error("Workflow evaluation failed:", error.message);
    throw error;
  }
};

export default evaluateWorkflows;
