import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "../utils/auth";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
  user?: JWTPayload;
  token?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = verifyToken(token);
      req.user = payload;
      req.token = token;
      next();
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }
  } catch (error) {
    next(error);
  }
}

// Optional auth - doesn't throw if no token
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const payload = verifyToken(token);
        req.user = payload;
        req.token = token;
      } catch {
        // Token invalid, but that's okay for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
