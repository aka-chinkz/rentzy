import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileFilter = (_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
  }
};

// Use memory storage so we can process with sharp before saving
const memoryStorage = multer.memoryStorage();

// Allow larger uploads (25MB) — we compress to WebP on the server
const maxSize = 25 * 1024 * 1024;

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: maxSize },
});

/** Convert buffer to WebP, resize if needed, save to disk, return filename */
async function processAndSaveAsWebp(buffer: Buffer): Promise<string> {
  const filename = `${uuidv4()}.webp`;
  const filePath = path.join(uploadsDir, filename);

  await sharp(buffer)
    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(filePath);

  return filename;
}

// Upload single image → convert to WebP
router.post("/image", authMiddleware, upload.single("image"), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw new AppError("No file uploaded", 400);
    }

    const filename = await processAndSaveAsWebp(req.file.buffer);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${baseUrl}/uploads/${filename}`;

    res.json({ url, filename });
  } catch (error) {
    next(error);
  }
});

// Upload multiple images → convert each to WebP
router.post("/images", authMiddleware, upload.array("images", 10), async (req: AuthRequest, res, next) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const urls: string[] = [];

    for (const file of files) {
      if (!file.buffer) continue;
      const filename = await processAndSaveAsWebp(file.buffer);
      urls.push(`${baseUrl}/uploads/${filename}`);
    }

    if (urls.length === 0) {
      throw new AppError("No valid images to upload", 400);
    }

    res.json({ urls });
  } catch (error) {
    next(error);
  }
});

// Upload avatar → convert to WebP (smaller size for avatars)
router.post("/avatar", authMiddleware, upload.single("avatar"), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw new AppError("No file uploaded", 400);
    }

    const filename = `${uuidv4()}.webp`;
    const filePath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 85 })
      .toFile(filePath);

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${baseUrl}/uploads/${filename}`;

    res.json({ url, filename });
  } catch (error) {
    next(error);
  }
});

// Delete image
router.delete("/image", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      throw new AppError("File name required", 400);
    }

    const filePath = path.join(uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "File deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
