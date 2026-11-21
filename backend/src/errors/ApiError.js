
/**
 * ApiError — A custom error class for NexusFlow.
 *
 * WHY this exists:
 *   JavaScript's built-in Error class only carries a message.
 *   We need to also carry an HTTP status code (like 400, 404, 409)
 *   so the centralized error handler can send the right status to the client.
 *
 * HOW to use it:
 *   throw new ApiError(404, "Device not found");
 *   throw new ApiError(409, "Device ID already exists");
 *   throw new ApiError(400, "Temperature must be a number");
 *
 * The centralized error handler in errorHandler.js will catch it and
 * automatically use statusCode + message in the response.
 */

class ApiError extends Error {
  constructor(statusCode, message) {
    // Call the parent Error constructor with the message
    super(message);

    // Store the HTTP status code (e.g. 400, 401, 403, 404, 409, 500)
    this.statusCode = statusCode;

    // Name helps when reading logs — shows "ApiError" instead of just "Error"
    this.name = "ApiError";

    // isOperational = true means this is a known, expected error (not a bug).
    // We handle these gracefully with a clean JSON response.
    // Unexpected crashes (bugs) will be isOperational = false (default from Error class).
    this.isOperational = true;
  }
}

export default ApiError;
