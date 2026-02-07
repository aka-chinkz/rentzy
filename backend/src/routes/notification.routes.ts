import { Router } from "express";
import pool from "../config/database";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// Get notifications
router.get("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { limit = "50", page = "1" } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.userId, parseInt(limit as string), offset]
    );

    // Get unread count
    const unreadResult = await pool.query(
      "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
      [req.user!.userId]
    );

    res.json({
      notifications: result.rows,
      unread_count: parseInt(unreadResult.rows[0].count),
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch("/:id/read", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
      [id, req.user!.userId]
    );

    res.json({ message: "Marked as read" });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.patch("/read-all", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1",
      [req.user!.userId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete("/:id", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [id, req.user!.userId]
    );

    res.json({ message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
