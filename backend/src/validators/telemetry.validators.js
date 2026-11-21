
/**
 * Telemetry Validators — Zod schemas for sensor readings.
 *
 * Rules:
 * - deviceId is always required.
 * - At least one sensor reading (temperature, humidity, or pressure) is required.
 * - Each reading must be within a physically realistic range.
 * - Timestamp is optional (defaults to now on the server side).
 *
 * Note: We use z.coerce.number() instead of z.number() because HTTP request
 * bodies sometimes carry numbers as strings. z.coerce converts "23.5" → 23.5.
 */

import z from "zod";

// ─────────────────────────────────────────────
// TELEMETRY CREATE SCHEMA
// ─────────────────────────────────────────────
export const createTelemetrySchema = z
  .object({
    // Device identifier (string, not MongoDB ObjectId)
    deviceId: z
      .string({ error: "Device ID must be a string" })
      .trim()
      .min(1, "Device ID is required"),

    // Temperature: physically realistic range –100°C to 200°C
    temperature: z.coerce
      .number({ error: "Temperature must be a number" })
      .min(-100, "Temperature cannot be below -100°C")
      .max(200, "Temperature cannot exceed 200°C")
      .optional(),

    // Humidity: 0% to 100%
    humidity: z.coerce
      .number({ error: "Humidity must be a number" })
      .min(0, "Humidity cannot be below 0%")
      .max(100, "Humidity cannot exceed 100%")
      .optional(),

    // Pressure: must be a positive number (hPa or similar)
    pressure: z.coerce
      .number({ error: "Pressure must be a number" })
      .min(0, "Pressure cannot be negative")
      .optional(),

    // Optional timestamp — if supplied, it must parse to a valid date
    timestamp: z.coerce.date().optional(),
  })
  // Cross-field rule: at least one sensor reading must be present
  .refine(
    (data) =>
      data.temperature !== undefined ||
      data.humidity !== undefined ||
      data.pressure !== undefined,
    {
      message:
        "At least one sensor reading is required (temperature, humidity, or pressure)",
      // We point the error at the top level since it spans multiple fields
      path: [],
    }
  );
