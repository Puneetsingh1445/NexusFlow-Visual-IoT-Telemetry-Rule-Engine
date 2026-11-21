
/**
 * errorHandler — Centralized Express error-handling middleware.
 *
 * HOW Express error middleware works:
 *   It must have EXACTLY 4 parameters: (err, req, res, next).
 *   That 4th parameter is what tells Express this is an error handler.
 *   It must be registered LAST in app.js, after all routes.
 *
 * HOW errors reach here:
 *   - From controllers:    next(new ApiError(404, "Not found"))
 *   - From Zod middleware: next(new ApiError(422, "Validation failed", errors))
 *   - From Express itself: unhandled throws inside async functions
 *
 * This single function handles ALL of these cases consistently.
 */

import ApiError from "../errors/ApiError.js";

const errorHandler = (err, req, res, next) => {

  // ─────────────────────────────────────────────────────────────
  // CASE 1: Our own ApiError (thrown intentionally in controllers)
  // ─────────────────────────────────────────────────────────────
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      // If the error carries field-level details (from Zod), include them
      ...(err.errors && { errors: err.errors }),
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CASE 2: Mongoose Validation Error
  // Happens when a document fails schema validation before saving.
  // Example: a required field is missing, or an enum value is wrong.
  // ─────────────────────────────────────────────────────────────
  if (err.name === "ValidationError") {
    // Extract all field-level messages from Mongoose into a clean array
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CASE 3: MongoDB Duplicate Key Error (error code 11000)
  // Happens when you try to insert a document with a value that
  // already exists in a "unique" index.
  // Example: registering with an email that already exists,
  //          or creating a device with a deviceId already in use.
  // ─────────────────────────────────────────────────────────────
  if (err.code === 11000) {
    // Extract which field caused the duplicate (e.g. "email", "deviceId")
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists${value ? `: "${value}"` : ""}.`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CASE 4: Invalid MongoDB ObjectId (CastError)
  // Happens when a URL parameter like /api/workflows/:id contains
  // something that is not a valid 24-character MongoDB ObjectId.
  // Example: GET /api/workflows/abc → CastError
  // ─────────────────────────────────────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: "${err.value}"`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CASE 5: JWT Errors (extra safety net — authMiddleware handles most)
  // ─────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again.",
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CASE 6: Everything else — unexpected server errors (bugs)
  // We log the full error stack but send a generic message to the
  // client so we never leak internal details.
  // ─────────────────────────────────────────────────────────────
  console.error("Unexpected server error:", err);

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred. Please try again later.",
  });
};

export default errorHandler;
