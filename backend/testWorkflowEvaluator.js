
import "dotenv/config";
import connectDB from "./src/config/database.js";
import evaluateWorkflows from "./src/services/workflowEvaluator.js";

const testWorkflow = async () => {
  try {
    await connectDB();

    const reading = {
      deviceId: "TEMP001",
      temperature: 95,
    };

    console.log("Incoming Sensor Data:", reading);

    const results = await evaluateWorkflows(reading);

    console.log("Workflow Evaluation Results:");
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    process.exit(0);
  }
};

testWorkflow();
