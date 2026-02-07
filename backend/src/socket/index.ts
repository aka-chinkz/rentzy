import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/auth";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupSocketHandlers(io: Server) {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      try {
        const payload = verifyToken(token);
        socket.userId = payload.userId;
        next();
      } catch (error) {
        return next(new Error("Invalid token"));
      }
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join a conversation room
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on("typing_start", (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("typing_stop", (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user_stopped_typing", {
        userId: socket.userId,
        conversationId: data.conversationId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
}
