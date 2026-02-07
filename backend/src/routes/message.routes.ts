import { Router } from "express";
import pool from "../config/database";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Get all conversations
router.get("/conversations", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
        p1.full_name as p1_name, p1.avatar_url as p1_avatar,
        p2.full_name as p2_name, p2.avatar_url as p2_avatar,
        i.title as item_title, i.images as item_images
       FROM conversations c
       LEFT JOIN profiles p1 ON c.participant_1 = p1.id
       LEFT JOIN profiles p2 ON c.participant_2 = p2.id
       LEFT JOIN items i ON c.item_id = i.id
       WHERE c.participant_1 = $1 OR c.participant_2 = $1
       ORDER BY c.last_message_at DESC NULLS LAST`,
      [req.user!.userId]
    );

    const conversations = result.rows.map((row) => {
      const isP1 = row.participant_1 === req.user!.userId;
      return {
        ...row,
        other_user: {
          id: isP1 ? row.participant_2 : row.participant_1,
          full_name: isP1 ? row.p2_name : row.p1_name,
          avatar_url: isP1 ? row.p2_avatar : row.p1_avatar,
        },
        item: row.item_id ? {
          id: row.item_id,
          title: row.item_title,
          images: row.item_images,
        } : null,
        unread_count: isP1 ? row.unread_count_1 : row.unread_count_2,
      };
    });

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
});

// Get single conversation with messages
router.get("/conversations/:id", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Get conversation
    const convResult = await pool.query(
      `SELECT c.*,
        p1.full_name as p1_name, p1.avatar_url as p1_avatar,
        p2.full_name as p2_name, p2.avatar_url as p2_avatar,
        i.title as item_title, i.images as item_images
       FROM conversations c
       LEFT JOIN profiles p1 ON c.participant_1 = p1.id
       LEFT JOIN profiles p2 ON c.participant_2 = p2.id
       LEFT JOIN items i ON c.item_id = i.id
       WHERE c.id = $1`,
      [id]
    );

    if (convResult.rows.length === 0) {
      throw new AppError("Conversation not found", 404);
    }

    const row = convResult.rows[0];
    const isP1 = row.participant_1 === req.user!.userId;

    if (!isP1 && row.participant_2 !== req.user!.userId) {
      throw new AppError("Not authorized", 403);
    }

    const conversation = {
      ...row,
      other_user: {
        id: isP1 ? row.participant_2 : row.participant_1,
        full_name: isP1 ? row.p2_name : row.p1_name,
        avatar_url: isP1 ? row.p2_avatar : row.p1_avatar,
      },
      item: row.item_id ? {
        id: row.item_id,
        title: row.item_title,
        images: row.item_images,
      } : null,
    };

    // Get messages
    const messagesResult = await pool.query(
      `SELECT m.*, p.full_name as sender_name, p.avatar_url as sender_avatar
       FROM messages m
       LEFT JOIN profiles p ON m.sender_id = p.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    // Mark messages as read
    const unreadColumn = isP1 ? "unread_count_1" : "unread_count_2";
    await pool.query(
      `UPDATE conversations SET ${unreadColumn} = 0 WHERE id = $1`,
      [id]
    );

    await pool.query(
      `UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2`,
      [id, req.user!.userId]
    );

    res.json({ conversation, messages: messagesResult.rows });
  } catch (error) {
    next(error);
  }
});

// Start new conversation
router.post("/conversations", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { participant_id, message, item_id } = req.body;

    if (participant_id === req.user!.userId) {
      throw new AppError("Cannot message yourself", 400);
    }

    // Check if conversation exists
    const existingResult = await pool.query(
      `SELECT id FROM conversations
       WHERE (participant_1 = $1 AND participant_2 = $2)
          OR (participant_1 = $2 AND participant_2 = $1)`,
      [req.user!.userId, participant_id]
    );

    let conversationId: string;

    if (existingResult.rows.length > 0) {
      conversationId = existingResult.rows[0].id;
    } else {
      conversationId = uuidv4();
      await pool.query(
        `INSERT INTO conversations (id, participant_1, participant_2, item_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [conversationId, req.user!.userId, participant_id, item_id]
      );
    }

    // Send initial message if provided
    if (message) {
      await pool.query(
        `INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), conversationId, req.user!.userId, message]
      );

      await pool.query(
        `UPDATE conversations SET last_message = $1, last_message_at = NOW(), unread_count_2 = unread_count_2 + 1 WHERE id = $2`,
        [message, conversationId]
      );
    }

    res.json({ conversation: { id: conversationId } });
  } catch (error) {
    next(error);
  }
});

// Send message
router.post("/conversations/:id/messages", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check if user is part of conversation
    const convResult = await pool.query(
      "SELECT participant_1, participant_2 FROM conversations WHERE id = $1",
      [id]
    );

    if (convResult.rows.length === 0) {
      throw new AppError("Conversation not found", 404);
    }

    const conv = convResult.rows[0];
    const isP1 = conv.participant_1 === req.user!.userId;
    const isP2 = conv.participant_2 === req.user!.userId;

    if (!isP1 && !isP2) {
      throw new AppError("Not authorized", 403);
    }

    const messageId = uuidv4();
    await pool.query(
      `INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [messageId, id, req.user!.userId, content]
    );

    // Update conversation
    const unreadColumn = isP1 ? "unread_count_2" : "unread_count_1";
    await pool.query(
      `UPDATE conversations SET last_message = $1, last_message_at = NOW(), ${unreadColumn} = ${unreadColumn} + 1 WHERE id = $2`,
      [content, id]
    );

    res.json({ message_id: messageId });
  } catch (error) {
    next(error);
  }
});

export default router;
