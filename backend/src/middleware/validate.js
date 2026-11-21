
/**
 * validate — A middleware factory that runs a Zod schema check.
 *
 * HOW it works:
 *   You call validate(schema) in a route definition.
 *   It returns a real Express middleware function.
 *   That middleware runs the Zod schema against the request.
 *   If validation passes  → calls next() and the controller runs.
 *   If validation fails   → calls next(error) and the error handler responds.
 *
 * HOW to use it in a route file:
 *   import { validate } from "../middleware/validate.js";
 *   import { createDeviceSchema } from "../validators/device.validators.js";
 *   router.post("/", validate(createDeviceSchema), createDevice);
 *
 * WHAT "source" means:
 *   "body"   → validates req.body   (POST/PUT data)
 *   "params" → validates req.params (URL path variables like :id)
 *   "query"  → validates req.query  (URL query string like ?limit=10)
 */

import ApiError from "../errors/ApiError.js";

/**
 * @param {import("zod").ZodSchema} schema  - The Zod schema to validate against
 * @param {"body"|"params"|"query"} source  - Which part of the request to validate
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    // Run the Zod schema against the chosen request source
    const result = schema.safeParse(req[source]);

    // ✅ Validation passed — replace the data with the parsed/coerced version
    // This is important: Zod can transform values (e.g. trim strings, coerce numbers).
    // We write the cleaned data back to req[source] so controllers receive clean input.
    if (result.success) {
      req[source] = result.data;
      return next();
    }

    // ❌ Validation failed — build a user-friendly list of errors
    // Zod v4 returns errors in result.error.issues
    const errors = result.error.issues.map((issue) => ({
      // "path" tells which field failed, e.g. ["condition", "value"]
      field: issue.path.join(".") || "unknown",
      message: issue.message,
    }));

    // Create an ApiError with status 422 (Unprocessable Entity)
    // 422 means "the request was understood but the data is invalid"
    const error = new ApiError(422, "Validation failed");
    // Attach the field-level errors so the error handler can include them
    error.errors = errors;

    return next(error);
  };
};
