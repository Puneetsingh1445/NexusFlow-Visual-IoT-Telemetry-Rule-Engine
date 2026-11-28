
/**
 * Device Validators — Zod schemas for device registration and updates.
 *
 * deviceId is a user-supplied string identifier (not MongoDB's _id).
 * It is unique per device and used throughout the system.
 *
 * WHAT CHANGED:
 * - updateDeviceStatusSchema (stub) replaced with updateDeviceSchema.
 *   The new schema allows partial updates to name, deviceType, location, status.
 *   It explicitly blocks deviceId and userId from being changed.
 *
 * WHAT IS UNCHANGED:
 * - createDeviceSchema is identical.
 * - DEVICE_TYPES and DEVICE_STATUSES constants are identical.
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
// UPDATE DEVICE SCHEMA
// Used by PUT /api/devices/:id
//
// All fields are OPTIONAL — this allows partial updates (e.g. only change name).
// deviceId and userId are explicitly BLOCKED — they must never be changed.
// ─────────────────────────────────────────────
export const updateDeviceSchema = z
  .object({
    // Optional name update
    name: z
      .string({ error: "Device name must be a string" })
      .trim()
      .min(1, "Device name cannot be empty")
      .max(100, "Device name must not exceed 100 characters")
      .optional(),

    // Optional device type update — must still be a valid enum value
    deviceType: z
      .enum(DEVICE_TYPES, {
        error: `Device type must be one of: ${DEVICE_TYPES.join(", ")}`,
      })
      .optional(),

    // Optional location update
    location: z
      .string()
      .trim()
      .max(200, "Location must not exceed 200 characters")
      .optional(),

    // Optional status update — only valid values allowed
    status: z
      .enum(DEVICE_STATUSES, {
        error: `Status must be one of: ${DEVICE_STATUSES.join(", ")}`,
      })
      .optional(),

    // BLOCKED: deviceId must never be changed after creation.
    // z.never() causes Zod to reject the request if this field is present.
    deviceId: z
      .never({ error: "Device ID cannot be changed after creation" })
      .optional(),

    // BLOCKED: userId must never be changed — it is set from the JWT, not the body.
    userId: z
      .never({ error: "Ownership cannot be changed" })
      .optional(),
  })
  // Cross-field rule: reject the request if the body is completely empty.
  // A PUT with no fields is meaningless — at least one must be provided.
  .refine(
    (data) => {
      const allowed = ["name", "deviceType", "location", "status"];
      return allowed.some((key) => data[key] !== undefined);
    },
    {
      message:
        "At least one field must be provided to update (name, deviceType, location, or status)",
    }
  );
