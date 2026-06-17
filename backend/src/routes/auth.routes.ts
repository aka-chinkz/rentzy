import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import pool from "../config/database";
import { hashPassword, verifyPassword, generateToken, generateRefreshToken, verifyToken } from "../utils/auth";
import { generatePasswordResetToken, hashResetToken } from "../utils/passwordReset";
import { sendPasswordResetEmail } from "../utils/email";
import { validateBody } from "../middleware/validate";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many reset requests. Please try again later." },
});

const PASSWORD_RESET_RESPONSE = {
  message: "If an account exists for that email, we've sent password reset instructions.",
};

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

// Sign up
router.post("/signup", validateBody(signUpSchema), async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError("Email already registered", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [userId, email, hashedPassword]
    );

    // Create profile
    await pool.query(
      `INSERT INTO profiles (id, email, full_name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [userId, email, fullName]
    );

    // Generate tokens
    const accessToken = generateToken({ userId, email });
    const refreshToken = generateRefreshToken({ userId, email });

    // Get profile
    const profileResult = await pool.query(
      "SELECT * FROM profiles WHERE id = $1",
      [userId]
    );

    res.status(201).json({
      message: "Account created successfully",
      user: { id: userId, email },
      profile: profileResult.rows[0],
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Sign in
router.post("/signin", validateBody(signInSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user
    const userResult = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate tokens
    const accessToken = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Get profile
    const profileResult = await pool.query(
      "SELECT * FROM profiles WHERE id = $1",
      [user.id]
    );

    res.json({
      user: { id: user.id, email: user.email },
      profile: profileResult.rows[0],
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Sign out (client-side token removal, but we can log it)
router.post("/signout", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    // In a production app, you might want to blacklist the token
    res.json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const profileResult = await pool.query(
      "SELECT * FROM profiles WHERE id = $1",
      [req.user!.userId]
    );

    if (profileResult.rows.length === 0) {
      throw new AppError("Profile not found", 404);
    }

    res.json({
      user: { id: req.user!.userId, email: req.user!.email },
      profile: profileResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post("/refresh", async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new AppError("Refresh token required", 400);
    }

    // Verify refresh token
    const payload = verifyToken(refresh_token);

    // Generate new tokens
    const accessToken = generateToken({ userId: payload.userId, email: payload.email });
    const refreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    next(new AppError("Invalid refresh token", 401));
  }
});

// Request password reset — always returns the same message (prevents email enumeration)
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validateBody(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const userResult = await pool.query(
        "SELECT id, email FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))",
        [email]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        const { token, tokenHash, expiresAt } = generatePasswordResetToken();

        await pool.query(
          "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
          [user.id]
        );

        await pool.query(
          `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
           VALUES ($1, $2, $3)`,
          [user.id, tokenHash, expiresAt]
        );

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

        let devResetUrl: string | undefined;

        try {
          const { delivered } = await sendPasswordResetEmail(user.email, resetUrl);
          if (!delivered && process.env.NODE_ENV !== "production") {
            devResetUrl = resetUrl;
          }
        } catch (emailError) {
          await pool.query("DELETE FROM password_reset_tokens WHERE token_hash = $1", [tokenHash]);
          console.error("Failed to send password reset email:", emailError);
        }

        res.json({
          ...PASSWORD_RESET_RESPONSE,
          ...(devResetUrl ? { dev_reset_url: devResetUrl } : {}),
        });
        return;
      }

      res.json(PASSWORD_RESET_RESPONSE);
    } catch (error) {
      next(error);
    }
  }
);

// Reset password with one-time token
router.post("/reset-password", validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const tokenHash = hashResetToken(token);

    const tokenResult = await pool.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      throw new AppError("Invalid or expired reset link. Please request a new one.", 400);
    }

    const resetRecord = tokenResult.rows[0];
    const hashedPassword = await hashPassword(password);

    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, resetRecord.user_id]
    );

    await pool.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
      [resetRecord.user_id]
    );

    res.json({ message: "Password updated successfully. You can now sign in." });
  } catch (error) {
    next(error);
  }
});

export default router;
