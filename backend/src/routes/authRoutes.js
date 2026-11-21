
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";

const router = express.Router();

// POST /api/auth/register
// validate(registerSchema) runs FIRST → cleans the body → then registerUser runs
router.post("/register", validate(registerSchema), registerUser);

// POST /api/auth/login
router.post("/login", validate(loginSchema), loginUser);

export default router;
