
/**
 * Alert Validators — Zod schemas for alert route parameters.
 *
 * Alert creation is handled internally by the rule engine (not via API),
 * so we only need to validate the route parameters used for
 * read, mark-as-read, and delete operations.
 */

import z from "zod";

// ─────────────────────────────────────────────
// MONGODB OBJECTID PARAM SCHEMA
// Used for routes like PATCH /api/alerts/:id and DELETE /api/alerts/:id
// ─────────────────────────────────────────────

// A valid MongoDB ObjectId is exactly 24 hexadecimal characters
const mongoIdRegex = /^[a-fA-F0-9]{24}$/;

export const alertIdParamSchema = z.object({
  id: z
    .string({ error: "Alert ID must be a string" })
    .regex(mongoIdRegex, "Invalid alert ID format — must be a 24-character hex string"),
});

// ─────────────────────────────────────────────
// DEVICE ID PARAM SCHEMA
// Used for GET /api/alerts/device/:deviceId
// ─────────────────────────────────────────────
export const deviceIdParamSchema = z.object({
  deviceId: z
    .string({ error: "Device ID must be a string" })
    .trim()
    .min(1, "Device ID is required")
    .max(64, "Device ID is too long"),
});

// ─────────────────────────────────────────────
// WORKFLOW ID PARAM SCHEMA  (reusable for workflow routes too)
// ─────────────────────────────────────────────
export const mongoIdParamSchema = z.object({
  id: z
    .string({ error: "ID must be a string" })
    .regex(mongoIdRegex, "Invalid ID format — must be a 24-character hex string"),
});
