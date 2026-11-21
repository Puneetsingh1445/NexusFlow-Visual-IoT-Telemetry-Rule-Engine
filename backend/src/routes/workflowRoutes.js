
import express from "express";
import {
  createWorkflow,
  getWorkflows,
  updateWorkflow,
  deleteWorkflow,
} from "../controllers/workflowController.js";
import { validate } from "../middleware/validate.js";
import {
  createWorkflowSchema,
  updateWorkflowSchema,
} from "../validators/workflow.validators.js";
import { mongoIdParamSchema } from "../validators/alert.validators.js";

const router = express.Router();

// POST /api/workflows — Create a workflow (validate body)
router.post("/", validate(createWorkflowSchema), createWorkflow);

// GET /api/workflows — Get all workflows for the logged-in user
router.get("/", getWorkflows);

// PUT /api/workflows/:id — Update a workflow (validate :id param + body)
router.put(
  "/:id",
  validate(mongoIdParamSchema, "params"),
  validate(updateWorkflowSchema),
  updateWorkflow
);

// DELETE /api/workflows/:id — Delete a workflow (validate :id param)
router.delete("/:id", validate(mongoIdParamSchema, "params"), deleteWorkflow);

export default router;
