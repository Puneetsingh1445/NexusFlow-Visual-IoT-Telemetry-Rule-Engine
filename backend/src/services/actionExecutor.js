
import Alert from "../models/Alert.js";

const executeAction = async (workflow, reading) => {
  try {
    // Check whether the configured action is an alert
    if (workflow.action === "alert") {
      const parameter = workflow.condition.parameter;
      const actualValue = reading[parameter];
      const threshold = workflow.condition.value;

      // Create alert message
      const message = `${parameter} is ${actualValue}. Condition: ${parameter} ${workflow.condition.operator} ${threshold}.`;

      // Save alert in MongoDB
      const alert = await Alert.create({
        deviceId: reading.deviceId,
        workflowId: workflow._id,
        workflowName: workflow.name,
        message,
        severity: "high",
        sensorData: reading,
      });

      return {
        success: true,
        action: "alert",
        message: "Alert created successfully",
        alert,
      };
    }

    // Webhook execution will be implemented separately
    return {
      success: false,
      action: workflow.action,
      message: "This action is not implemented yet",
    };

  } catch (error) {
    console.error("Action execution failed:", error.message);
    throw error;
  }
};

export default executeAction;
