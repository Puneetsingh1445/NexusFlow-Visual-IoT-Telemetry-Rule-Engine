
/**
 * Auth Validators — Zod schemas for user registration and login.
 *
 * These run BEFORE the controller, so the controller can trust
 * that req.body contains clean, validated data.
 */

import z from "zod";

// ─────────────────────────────────────────────
// REGISTER SCHEMA
// ─────────────────────────────────────────────
export const registerSchema = z.object({
  // Name: required, non-empty string, max 100 chars
  name: z
    .string({ error: "Name must be a string" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),

  // Email: must be a valid email format
  // z.email() in Zod v4 validates format automatically
  email: z
    .email({ error: "Please provide a valid email address" })
    .trim()
    .toLowerCase(),

  // Password: minimum 8 characters, at least one number for basic security
  password: z
    .string({ error: "Password must be a string" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .refine(
      (val) => /[0-9]/.test(val),
      "Password must contain at least one number"
    )
    .refine(
      (val) => /[a-zA-Z]/.test(val),
      "Password must contain at least one letter"
    ),
});

// ─────────────────────────────────────────────
// LOGIN SCHEMA
// ─────────────────────────────────────────────
export const loginSchema = z.object({
  // Email must be a valid format
  email: z
    .email({ error: "Please provide a valid email address" })
    .trim()
    .toLowerCase(),

  // Password only needs to be a non-empty string at login
  // (we don't re-enforce complexity — just check it's present)
  password: z
    .string({ error: "Password must be a string" })
    .min(1, "Password is required"),
});
