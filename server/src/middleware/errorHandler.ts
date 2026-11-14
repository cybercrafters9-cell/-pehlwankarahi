import { Request, Response, NextFunction } from "express";

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

export const getErrorMessage = (error: unknown, fallback = "Internal Server Error"): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  void _next;

  // Handle body-parser JSON syntax errors cleanly
  if (
    (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400)) ||
    err.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON",
    });
  }

  const rawStatus = err.status || err.statusCode || 500;
  const status =
    typeof rawStatus === "number" && rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;

  console.error("[ServerError]:", err);

  const isProd = process.env.NODE_ENV === "production";
  const message =
    status >= 500 && isProd
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
