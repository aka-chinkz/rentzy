import { Router } from "express";
import pool from "../config/database";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Get reviews for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT r.*, p.full_name as reviewer_name, p.avatar_url as reviewer_avatar,
        i.title as item_title
       FROM reviews r
       LEFT JOIN profiles p ON r.reviewer_id = p.id
       LEFT JOIN items i ON r.item_id = i.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({ reviews: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get reviews for an item
router.get("/item/:itemId", async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const result = await pool.query(
      `SELECT r.*, p.full_name as reviewer_name, p.avatar_url as reviewer_avatar
       FROM reviews r
       LEFT JOIN profiles p ON r.reviewer_id = p.id
       WHERE r.item_id = $1
       ORDER BY r.created_at DESC`,
      [itemId]
    );

    res.json({ reviews: result.rows });
  } catch (error) {
    next(error);
  }
});

// Create review
router.post("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { rental_request_id, rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    // Get rental details
    const rentalResult = await pool.query(
      "SELECT * FROM rental_requests WHERE id = $1",
      [rental_request_id]
    );

    if (rentalResult.rows.length === 0) {
      throw new AppError("Rental not found", 404);
    }

    const rental = rentalResult.rows[0];

    // Determine who is reviewing whom
    const isRenter = rental.renter_id === req.user!.userId;
    const isOwner = rental.owner_id === req.user!.userId;

    if (!isRenter && !isOwner) {
      throw new AppError("Not authorized", 403);
    }

    const revieweeId = isRenter ? rental.owner_id : rental.renter_id;
    const reviewType = isRenter ? "renter_to_owner" : "owner_to_renter";

    // Check if already reviewed
    const existingReview = await pool.query(
      "SELECT id FROM reviews WHERE rental_request_id = $1 AND reviewer_id = $2",
      [rental_request_id, req.user!.userId]
    );

    if (existingReview.rows.length > 0) {
      throw new AppError("Already reviewed this rental", 400);
    }

    const reviewId = uuidv4();
    await pool.query(
      `INSERT INTO reviews (id, rental_request_id, reviewer_id, reviewee_id, item_id, rating, comment, review_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [reviewId, rental_request_id, req.user!.userId, revieweeId, rental.item_id, rating, comment, reviewType]
    );

    // Update reviewee's rating
    const profileResult = await pool.query(
      "SELECT rating, total_reviews FROM profiles WHERE id = $1",
      [revieweeId]
    );

    if (profileResult.rows.length > 0) {
      const profile = profileResult.rows[0];
      const newTotalReviews = profile.total_reviews + 1;
      const newRating = ((profile.rating * profile.total_reviews) + rating) / newTotalReviews;

      await pool.query(
        "UPDATE profiles SET rating = $1, total_reviews = $2 WHERE id = $3",
        [newRating, newTotalReviews, revieweeId]
      );
    }

    res.status(201).json({ review_id: reviewId, message: "Review submitted" });
  } catch (error) {
    next(error);
  }
});

export default router;
