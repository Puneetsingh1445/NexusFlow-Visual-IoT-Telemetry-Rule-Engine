
import Workflow from "../models/Workflow.js";
import evaluateCondition from "./ruleEngine.js";
import executeAction from "./actionExecutor.js";

const evaluateWorkflows = async (reading) => {
  try {
    // Find active workflows for this device
    const workflows = await Workflow.find({
      deviceId: reading.deviceId,
      isActive: true,
    });

    const results = [];

    // Evaluate each workflow
    for (const workflow of workflows) {
      const matched = evaluateCondition(
        reading,
        workflow.condition
      );

      let execution = null;

      // Execute action only if condition matches
      if (matched) {
        try {
          execution = await executeAction(workflow, reading);
        } catch (error) {
          execution = {
            success: false,
            message: error.message,
          };
        }
      }

      results.push({
        workflowId: workflow._id,
        workflowName: workflow.name,
        matched,
        action: matched ? workflow.action : null,
        execution,
      });
    }

    return results;

  } catch (error) {
    console.error("Workflow evaluation failed:", error.message);
    throw error;
  }
};

export default evaluateWorkflows;
