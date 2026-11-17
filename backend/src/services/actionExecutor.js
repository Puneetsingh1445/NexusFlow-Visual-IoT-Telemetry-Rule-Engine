
import Alert from "../models/Alert.js";
import sendWebhook from "./webhookService.js";

const executeAction = async (workflow, reading, io = null) => {
  try {
    // ACTION 1: ALERT
    if (workflow.action === "alert") {
      const parameter = workflow.condition.parameter;
      const actualValue = reading[parameter];
      const threshold = workflow.condition.value;

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

      // Broadcast alert to connected frontend clients
      if (io) {
        io.emit("newAlert", alert);
        console.log("Real-time alert broadcast:", alert._id);
      }

      return {
        success: true,
        action: "alert",
        message: "Alert created successfully",
        alert,
      };
    }

    // ACTION 2: WEBHOOK
    if (workflow.action === "webhook") {
      if (!workflow.webhookUrl) {
        return {
          success: false,
          action: "webhook",
          message: "Webhook URL is missing",
        };
      }

      const webhookResult = await sendWebhook(
        workflow.webhookUrl,
        {
          deviceId: reading.deviceId,
          workflowId: workflow._id,
          workflowName: workflow.name,
          message: "Workflow condition matched",
          condition: workflow.condition,
          sensorData: reading,
          triggeredAt: new Date().toISOString(),
        }
      );

      return {
        success: webhookResult.success,
        action: "webhook",
        message: webhookResult.message,
        statusCode: webhookResult.statusCode,
        response: webhookResult.response,
      };
    }

    // UNSUPPORTED ACTION
    return {
      success: false,
      message: "Unsupported workflow action",
    };

  } catch (error) {
    console.error("Action execution failed:", error.message);

    return {
      success: false,
      message: error.message,
    };
  }
};

export default executeAction;
