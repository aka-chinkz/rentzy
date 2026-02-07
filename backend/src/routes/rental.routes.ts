import { Router } from "express";
import pool from "../config/database";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Get user's rentals
router.get("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { role = "renter" } = req.query;
    const column = role === "renter" ? "renter_id" : "owner_id";

    const result = await pool.query(
      `SELECT r.*, 
        i.title as item_title, i.images as item_images, i.rent_price_per_day,
        renter.full_name as renter_name, renter.avatar_url as renter_avatar,
        owner.full_name as owner_name, owner.avatar_url as owner_avatar
       FROM rental_requests r
       JOIN items i ON r.item_id = i.id
       LEFT JOIN profiles renter ON r.renter_id = renter.id
       LEFT JOIN profiles owner ON r.owner_id = owner.id
       WHERE r.${column} = $1
       ORDER BY r.created_at DESC`,
      [req.user!.userId]
    );

    const rentals = result.rows.map((row) => ({
      ...row,
      item: {
        id: row.item_id,
        title: row.item_title,
        images: row.item_images,
        rent_price_per_day: row.rent_price_per_day,
      },
      renter: {
        id: row.renter_id,
        full_name: row.renter_name,
        avatar_url: row.renter_avatar,
      },
      owner: {
        id: row.owner_id,
        full_name: row.owner_name,
        avatar_url: row.owner_avatar,
      },
    }));

    res.json({ rentals });
  } catch (error) {
    next(error);
  }
});

// Create rental request
router.post("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { item_id, start_date, end_date, message } = req.body;

    // Get item details
    const itemResult = await pool.query(
      "SELECT owner_id, rent_price_per_day, security_deposit, min_rental_days, max_rental_days FROM items WHERE id = $1",
      [item_id]
    );

    if (itemResult.rows.length === 0) {
      throw new AppError("Item not found", 404);
    }

    const item = itemResult.rows[0];

    if (item.owner_id === req.user!.userId) {
      throw new AppError("Cannot rent your own item", 400);
    }

    // Calculate total days and price
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = totalDays * parseFloat(item.rent_price_per_day);

    if (item.min_rental_days && totalDays < item.min_rental_days) {
      throw new AppError(`Minimum rental period is ${item.min_rental_days} days`, 400);
    }

    if (item.max_rental_days && totalDays > item.max_rental_days) {
      throw new AppError(`Maximum rental period is ${item.max_rental_days} days`, 400);
    }

    const rentalId = uuidv4();

    await pool.query(
      `INSERT INTO rental_requests (
        id, item_id, renter_id, owner_id, start_date, end_date,
        total_days, total_price, security_deposit, message, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW(), NOW())`,
      [
        rentalId,
        item_id,
        req.user!.userId,
        item.owner_id,
        start_date,
        end_date,
        totalDays,
        totalPrice,
        item.security_deposit || 0,
        message,
      ]
    );

    // Create notification for owner
    await pool.query(
      `INSERT INTO notifications (id, user_id, type, title, message, data, created_at)
       VALUES ($1, $2, 'rental_request', 'New Rental Request', $3, $4, NOW())`,
      [
        uuidv4(),
        item.owner_id,
        "Someone wants to rent your item",
        JSON.stringify({ rental_id: rentalId, item_id }),
      ]
    );

    res.status(201).json({ rental_id: rentalId, message: "Rental request sent" });
  } catch (error) {
    next(error);
  }
});

// Update rental status
router.patch("/:id/status", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const validStatuses = ["approved", "rejected", "cancelled", "rented", "returned"];
    if (!validStatuses.includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    // Get rental
    const rentalResult = await pool.query(
      "SELECT * FROM rental_requests WHERE id = $1",
      [id]
    );

    if (rentalResult.rows.length === 0) {
      throw new AppError("Rental not found", 404);
    }

    const rental = rentalResult.rows[0];

    // Check authorization
    const isOwner = rental.owner_id === req.user!.userId;
    const isRenter = rental.renter_id === req.user!.userId;

    if (!isOwner && !isRenter) {
      throw new AppError("Not authorized", 403);
    }

    // Update rental
    await pool.query(
      `UPDATE rental_requests SET status = $1, owner_response = $2, updated_at = NOW() WHERE id = $3`,
      [status, response, id]
    );

    // Create notification
    const recipientId = isOwner ? rental.renter_id : rental.owner_id;
    const notificationType = status === "approved" ? "request_approved" : status === "rejected" ? "request_rejected" : "item_returned";

    await pool.query(
      `INSERT INTO notifications (id, user_id, type, title, message, data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        uuidv4(),
        recipientId,
        notificationType,
        `Rental ${status}`,
        `Your rental request has been ${status}`,
        JSON.stringify({ rental_id: id }),
      ]
    );

    res.json({ message: `Rental ${status}` });
  } catch (error) {
    next(error);
  }
});

export default router;
