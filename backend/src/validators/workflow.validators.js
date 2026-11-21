
/**
 * Workflow Validators — Zod schemas for workflow create and update.
 *
 * A workflow ties a device to a condition and an action.
 * Example: "If temperature > 35 on device-001, send an alert."
 *
 * Webhook URL is conditionally required:
 *   - If action === "webhook", webhookUrl must be a valid HTTPS URL.
 *   - If action === "alert", webhookUrl is not needed.
 */

import z from "zod";

const CONDITION_PARAMETERS = ["temperature", "humidity", "pressure"];
const CONDITION_OPERATORS = ["greater_than", "less_than", "equal_to"];
const WORKFLOW_ACTIONS = ["alert", "webhook"];

// ─────────────────────────────────────────────
// CONDITION SUB-SCHEMA (reused in create + update)
// ─────────────────────────────────────────────
const conditionSchema = z.object({
  parameter: z.enum(CONDITION_PARAMETERS, {
    error: `Condition parameter must be one of: ${CONDITION_PARAMETERS.join(", ")}`,
  }),

  operator: z.enum(CONDITION_OPERATORS, {
    error: `Operator must be one of: ${CONDITION_OPERATORS.join(", ")}`,
  }),

  value: z.coerce
    .number({ error: "Condition value must be a number" })
    .finite("Condition value must be a finite number"),
});

// ─────────────────────────────────────────────
// CREATE WORKFLOW SCHEMA
// ─────────────────────────────────────────────
export const createWorkflowSchema = z
  .object({
    name: z
      .string({ error: "Workflow name must be a string" })
      .trim()
      .min(1, "Workflow name is required")
      .max(100, "Workflow name must not exceed 100 characters"),

    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters")
      .optional()
      .default(""),

    // The string deviceId (not MongoDB ObjectId) of the target device
    deviceId: z
      .string({ error: "Device ID must be a string" })
      .trim()
      .min(1, "Device ID is required"),

    condition: conditionSchema,

    action: z.enum(WORKFLOW_ACTIONS, {
      error: `Action must be one of: ${WORKFLOW_ACTIONS.join(", ")}`,
    }),

    // Optional webhook URL — validated conditionally below
    webhookUrl: z
      .url({ error: "Webhook URL must be a valid URL" })
      .refine(
        (val) => val.startsWith("https://"),
        "Webhook URL must use HTTPS"
      )
      .optional()
      .nullable(),

    isActive: z.boolean().optional().default(true),
  })
  // Cross-field rule: if action is "webhook", webhookUrl must be provided
  .refine(
    (data) => {
      if (data.action === "webhook") {
        return !!data.webhookUrl;
      }
      return true;
    },
    {
      message:
        "A valid HTTPS webhook URL is required when action is set to 'webhook'",
      path: ["webhookUrl"],
    }
  );

// ─────────────────────────────────────────────
// UPDATE WORKFLOW SCHEMA  (all fields are optional for partial updates)
// ─────────────────────────────────────────────
export const updateWorkflowSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Workflow name cannot be empty")
      .max(100, "Workflow name must not exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters")
      .optional(),

    condition: conditionSchema.optional(),

    action: z.enum(WORKFLOW_ACTIONS).optional(),

    webhookUrl: z
      .url({ error: "Webhook URL must be a valid URL" })
      .refine(
        (val) => val.startsWith("https://"),
        "Webhook URL must use HTTPS"
      )
      .optional()
      .nullable(),

    isActive: z.boolean().optional(),

    // Explicitly BLOCK these fields — users must never be able to change
    // deviceId or userId via the update endpoint
    deviceId: z.never({ error: "Device ID cannot be changed after creation" }).optional(),
    userId: z.never({ error: "Ownership cannot be changed" }).optional(),
  })
  .refine(
    (data) => {
      if (data.action === "webhook") {
        return !!data.webhookUrl;
      }
      return true;
    },
    {
      message:
        "A valid HTTPS webhook URL is required when action is set to 'webhook'",
      path: ["webhookUrl"],
    }
  );
