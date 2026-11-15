import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import multer from "multer";
import { mediaRepository } from "../repositories/media.repository";
import { asyncHandler } from "../middleware/asyncHandler";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB maximum
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

export const uploadSingleFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const handler = upload.single("file");
  handler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "File size exceeds the 2MB limit. Please compress before uploading.",
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || "Failed to process uploaded file.",
      });
    }
    next();
  });
};

function detectMimeType(
  buffer: Buffer
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return "image/webp";
  }

  return null;
}

export const uploadMedia = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please supply a 'file' field.",
      });
    }

    const detectedMime = detectMimeType(req.file.buffer);
    if (!detectedMime) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid image format. Buffer signature does not match supported formats (JPEG, PNG, WebP).",
      });
    }

    const hash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    const rawFilename = req.file.originalname || "image";
    const filename =
      rawFilename.length > 255 ? rawFilename.slice(0, 255) : rawFilename;

    const media = await mediaRepository.create(
      filename,
      detectedMime,
      req.file.size,
      req.file.buffer,
      hash
    );

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        id: media.id,
        filename: media.filename,
        mimeType: media.mime,
        sizeBytes: media.size,
        url: `/api/media/${media.id}`,
      },
    });
  }
);

export const serveMedia = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid media ID",
      });
    }

    const media = await mediaRepository.getById(id);
    if (!media) {
      return res.status(404).json({
        success: false,
        error: "Media not found",
      });
    }

    const etag = `"${media.hash || `${media.id}-${media.size}`}"`;

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    res.setHeader("Content-Type", media.mime);
    res.setHeader("Content-Length", media.size);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("ETag", etag);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    res.end(media.data);
  }
);

export const cleanupMedia = asyncHandler(
  async (_req: Request, res: Response) => {
    const deletedCount = await mediaRepository.cleanupOrphans();
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} orphan media records.`,
      data: { deletedCount },
    });
  }
);
