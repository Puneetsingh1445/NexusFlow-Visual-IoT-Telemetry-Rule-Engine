
/**
 * Device Validators — Zod schemas for device registration.
 *
 * deviceId is a user-supplied string identifier (not MongoDB's _id).
 * It is unique per device and used throughout the system.
 */

import z from "zod";

// Allowed device types — must match the enum in Device.js
const DEVICE_TYPES = ["temperature", "humidity", "pressure", "other"];
const DEVICE_STATUSES = ["online", "offline"];

// ─────────────────────────────────────────────
// CREATE DEVICE SCHEMA
// ─────────────────────────────────────────────
export const createDeviceSchema = z.object({
  // Human-readable device name
  name: z
    .string({ error: "Device name must be a string" })
    .trim()
    .min(1, "Device name is required")
    .max(100, "Device name must not exceed 100 characters"),

  // Unique device identifier supplied by the user/IoT system
  // Allow alphanumeric, hyphens, and underscores only
  deviceId: z
    .string({ error: "Device ID must be a string" })
    .trim()
    .min(1, "Device ID is required")
    .max(64, "Device ID must not exceed 64 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Device ID must only contain letters, numbers, hyphens, or underscores"
    ),

  // Must be one of the supported sensor types
  deviceType: z.enum(DEVICE_TYPES, {
    error: `Device type must be one of: ${DEVICE_TYPES.join(", ")}`,
  }),

  // Optional location string
  location: z
    .string()
    .trim()
    .max(200, "Location must not exceed 200 characters")
    .optional(),
});

// ─────────────────────────────────────────────
// UPDATE DEVICE STATUS SCHEMA  (for future PATCH /api/devices/:id)
// ─────────────────────────────────────────────
export const updateDeviceStatusSchema = z.object({
  status: z.enum(DEVICE_STATUSES, {
    error: `Status must be one of: ${DEVICE_STATUSES.join(", ")}`,
  }),
});
