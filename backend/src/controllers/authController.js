
/**
 * authController.js — User registration and login.
 *
 * WHAT CHANGED from the original:
 * - ALL manual validation (if !name, emailRegex, password.length checks) has been
 *   REMOVED from this file. That work is now done by Zod schemas in
 *   validators/auth.validators.js, applied by the validate middleware in the route.
 * - By the time these functions run, req.body is already cleaned and validated.
 * - try/catch blocks now use next(error) instead of inline res.status(500) responses.
 *   This lets the centralized errorHandler in middleware/errorHandler.js handle
 *   ALL error formatting consistently.
 *
 * WHAT IS UNCHANGED:
 * - bcrypt hashing, JWT generation, duplicate email handling — all identical.
 */

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../errors/ApiError.js";

// ─────────────────────────────────────────────
// USER REGISTRATION
// ─────────────────────────────────────────────
export const registerUser = async (req, res, next) => {
  try {
    // req.body is already validated by registerSchema — name, email, password are clean
    const { name, email, password } = req.body;

    // Check whether a user already exists with this email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // 409 Conflict — the resource (user with this email) already exists
      return next(new ApiError(409, "An account with this email already exists"));
    }

    // Hash the password (cost factor 12 — good balance of security vs speed)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user document in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate a JWT for immediate login after registration
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });

  } catch (error) {
    // Pass ALL errors to the centralized handler.
    // MongoDB duplicate key (11000) is handled there automatically.
    return next(error);
  }
};

// ─────────────────────────────────────────────
// USER LOGIN
// ─────────────────────────────────────────────
export const loginUser = async (req, res, next) => {
  try {
    // req.body is already validated by loginSchema — email and password are clean
    const { email, password } = req.body;

    // Find user — include password field (normally hidden by select: false in schema)
    const user = await User.findOne({ email }).select("+password");

    // IMPORTANT: We return the same message whether email is wrong OR password is wrong.
    // This prevents "user enumeration" — an attacker cannot discover which emails exist.
    if (!user) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    // Compare the plaintext password against the stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });

  } catch (error) {
    return next(error);
  }
};
