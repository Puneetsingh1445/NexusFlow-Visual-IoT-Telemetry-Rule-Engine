
import Workflow from "../models/Workflow.js";
import evaluateCondition from "./ruleEngine.js";
import executeAction from "./actionExecutor.js";

const evaluateWorkflows = async (reading, io = null) => {
  try {
    const workflows = await Workflow.find({
      deviceId: reading.deviceId,
      isActive: true,
    });

    const results = [];

    for (const workflow of workflows) {
      const matched = evaluateCondition(
        reading,
        workflow.condition
      );

      // CONDITION IS TRUE
      if (matched) {
        // Skip duplicate execution
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

        // Mark condition as active
        workflow.isConditionActive = true;
        await workflow.save();

        // Execute alert or webhook
        // Pass Socket.IO instance to actionExecutor
        const execution = await executeAction(
          workflow,
          reading,
          io
        );

        results.push({
          workflowId: workflow._id,
          workflowName: workflow.name,
          matched: true,
          action: workflow.action,
          executed: true,
          execution,
        });
      }

      // CONDITION IS FALSE: RESET
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
    console.error(
      "Workflow evaluation failed:",
      error.message
    );

    throw error;
  }
};

export default evaluateWorkflows;
