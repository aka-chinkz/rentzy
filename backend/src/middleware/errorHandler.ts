import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation failed",
      details: (err as any).errors,
    });
  }

  // Handle Multer errors (file type, size, etc.)
  if (err.name === "MulterError") {
    const multerErr = err as { code?: string; message?: string };
    const message =
      multerErr.code === "LIMIT_FILE_SIZE"
        ? "File too large. Maximum size is 25MB per image."
        : multerErr.code === "LIMIT_FILE_COUNT"
          ? "Too many files. Maximum is 10."
          : multerErr.message || "Upload error";
    return res.status(400).json({ error: message });
  }
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({ error: err.message });
  }

  // Handle Supabase errors
  if ((err as any).code) {
    const supabaseError = err as any;
    return res.status(400).json({
      error: supabaseError.message || "Database error",
      code: supabaseError.code,
    });
  }

  // Default error
  return res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { 
      message: err.message,
      stack: err.stack 
    }),
  });
}
