import { Router } from "express";
import { z } from "zod";
import pool from "../config/database";
import { validateBody } from "../middleware/validate";
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Get all items with filters
router.get("/", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      condition,
      sortBy = "newest",
      limit = "50",
      offset = "0",
    } = req.query;

    let query = `
      SELECT i.*, p.full_name as owner_name, p.avatar_url as owner_avatar, p.rating as owner_rating
      FROM items i
      LEFT JOIN profiles p ON i.owner_id = p.id
      WHERE i.is_available = true
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND i.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (minPrice) {
      query += ` AND i.rent_price_per_day >= $${paramIndex}`;
      params.push(parseFloat(minPrice as string));
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND i.rent_price_per_day <= $${paramIndex}`;
      params.push(parseFloat(maxPrice as string));
      paramIndex++;
    }

    if (condition) {
      const conditions = (condition as string).split(",");
      query += ` AND i.condition = ANY($${paramIndex})`;
      params.push(conditions);
      paramIndex++;
    }

    // Sorting
    switch (sortBy) {
      case "price_low":
        query += " ORDER BY i.rent_price_per_day ASC";
        break;
      case "price_high":
        query += " ORDER BY i.rent_price_per_day DESC";
        break;
      case "newest":
      default:
        query += " ORDER BY i.created_at DESC";
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Format items with owner info
    const items = result.rows.map((row) => ({
      ...row,
      owner: {
        id: row.owner_id,
        full_name: row.owner_name,
        avatar_url: row.owner_avatar,
        rating: row.owner_rating,
      },
    }));

    res.json({ items, total: items.length });
  } catch (error) {
    next(error);
  }
});

// Get single item
router.get("/:id", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const itemResult = await pool.query(
      `SELECT i.*, p.id as owner_id, p.full_name, p.avatar_url, p.rating, p.total_reviews, p.bio
       FROM items i
       LEFT JOIN profiles p ON i.owner_id = p.id
       WHERE i.id = $1`,
      [id]
    );

    if (itemResult.rows.length === 0) {
      throw new AppError("Item not found", 404);
    }

    const row = itemResult.rows[0];
    const item = {
      ...row,
      owner: {
        id: row.owner_id,
        full_name: row.full_name,
        avatar_url: row.avatar_url,
        rating: row.rating,
        total_reviews: row.total_reviews,
        bio: row.bio,
      },
    };

    // Get reviews for this item
    const reviewsResult = await pool.query(
      `SELECT r.*, p.full_name as reviewer_name, p.avatar_url as reviewer_avatar
       FROM reviews r
       LEFT JOIN profiles p ON r.reviewer_id = p.id
       WHERE r.item_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    // Check if saved by current user
    let isSaved = false;
    if (req.user) {
      const savedResult = await pool.query(
        "SELECT id FROM saved_items WHERE user_id = $1 AND item_id = $2",
        [req.user.userId, id]
      );
      isSaved = savedResult.rows.length > 0;
    }

    res.json({
      item,
      reviews: reviewsResult.rows,
      isSaved,
    });
  } catch (error) {
    next(error);
  }
});

// Increment views
router.post("/:id/view", async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE items SET views = views + 1 WHERE id = $1",
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Create item
router.post("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const {
      title,
      description,
      category_id,
      images,
      rent_price_per_day,
      security_deposit,
      condition,
      availability_start,
      availability_end,
      pickup_location_lat,
      pickup_location_lng,
      pickup_location_name,
      pickup_instructions,
      min_rental_days,
      max_rental_days,
    } = req.body;

    const itemId = uuidv4();

    await pool.query(
      `INSERT INTO items (
        id, owner_id, title, description, category_id, images,
        rent_price_per_day, security_deposit, condition,
        availability_start, availability_end,
        pickup_location_lat, pickup_location_lng, pickup_location_name, pickup_instructions,
        min_rental_days, max_rental_days, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())`,
      [
        itemId,
        req.user!.userId,
        title,
        description,
        category_id,
        images,
        rent_price_per_day,
        security_deposit || 0,
        condition,
        availability_start,
        availability_end,
        pickup_location_lat,
        pickup_location_lng,
        pickup_location_name,
        pickup_instructions,
        min_rental_days || 1,
        max_rental_days,
      ]
    );

    // Update items_listed count
    await pool.query(
      "UPDATE profiles SET items_listed = items_listed + 1 WHERE id = $1",
      [req.user!.userId]
    );

    const itemResult = await pool.query("SELECT * FROM items WHERE id = $1", [itemId]);

    res.status(201).json({ item: itemResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update item
router.patch("/:id", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const ownerCheck = await pool.query(
      "SELECT owner_id FROM items WHERE id = $1",
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      throw new AppError("Item not found", 404);
    }

    if (ownerCheck.rows[0].owner_id !== req.user!.userId) {
      throw new AppError("Not authorized", 403);
    }

    const updates = req.body;
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== "id" && key !== "owner_id") {
        setClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(id);

    await pool.query(
      `UPDATE items SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
      params
    );

    const itemResult = await pool.query("SELECT * FROM items WHERE id = $1", [id]);

    res.json({ item: itemResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Delete item
router.delete("/:id", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const ownerCheck = await pool.query(
      "SELECT owner_id FROM items WHERE id = $1",
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      throw new AppError("Item not found", 404);
    }

    if (ownerCheck.rows[0].owner_id !== req.user!.userId) {
      throw new AppError("Not authorized", 403);
    }

    await pool.query("DELETE FROM items WHERE id = $1", [id]);

    // Update items_listed count
    await pool.query(
      "UPDATE profiles SET items_listed = items_listed - 1 WHERE id = $1",
      [req.user!.userId]
    );

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
