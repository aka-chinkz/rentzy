import { Router } from "express";
import pool from "../config/database";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// Update current user's profile
router.patch("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const updates = req.body;
    const allowedFields = ["full_name", "bio", "phone", "avatar_url", "location_lat", "location_lng", "location_name"];
    
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(req.user!.userId);

    await pool.query(
      `UPDATE profiles SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
      params
    );

    const profileResult = await pool.query(
      "SELECT * FROM profiles WHERE id = $1",
      [req.user!.userId]
    );

    res.json({ profile: profileResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get current user's items
router.get("/me/items", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE owner_id = $1 ORDER BY created_at DESC",
      [req.user!.userId]
    );

    res.json({ items: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get current user's saved items
router.get("/me/saved", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.full_name as owner_name, p.avatar_url as owner_avatar
       FROM saved_items s
       JOIN items i ON s.item_id = i.id
       LEFT JOIN profiles p ON i.owner_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user!.userId]
    );

    const items = result.rows.map((row) => ({
      ...row,
      owner: {
        id: row.owner_id,
        full_name: row.owner_name,
        avatar_url: row.owner_avatar,
      },
    }));

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// Toggle save item
router.post("/me/saved/:itemId", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { itemId } = req.params;

    // Check if already saved
    const existingResult = await pool.query(
      "SELECT id FROM saved_items WHERE user_id = $1 AND item_id = $2",
      [req.user!.userId, itemId]
    );

    if (existingResult.rows.length > 0) {
      // Remove from saved
      await pool.query(
        "DELETE FROM saved_items WHERE user_id = $1 AND item_id = $2",
        [req.user!.userId, itemId]
      );
      res.json({ saved: false, message: "Removed from saved items" });
    } else {
      // Add to saved
      await pool.query(
        "INSERT INTO saved_items (user_id, item_id, created_at) VALUES ($1, $2, NOW())",
        [req.user!.userId, itemId]
      );
      res.json({ saved: true, message: "Added to saved items" });
    }
  } catch (error) {
    next(error);
  }
});

// Get user profile by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const profileResult = await pool.query(
      "SELECT * FROM profiles WHERE id = $1",
      [id]
    );

    if (profileResult.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    // Get user's items
    const itemsResult = await pool.query(
      "SELECT * FROM items WHERE owner_id = $1 AND is_available = true ORDER BY created_at DESC",
      [id]
    );

    // Get reviews about user
    const reviewsResult = await pool.query(
      `SELECT r.*, p.full_name as reviewer_name, p.avatar_url as reviewer_avatar
       FROM reviews r
       LEFT JOIN profiles p ON r.reviewer_id = p.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      profile: profileResult.rows[0],
      items: itemsResult.rows,
      reviews: reviewsResult.rows,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
