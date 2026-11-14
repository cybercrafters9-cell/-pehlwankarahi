import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ApiResponse } from "../types";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = (result.error as ZodError).issues
        .map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join(", ");

      return res.status(400).json({
        success: false,
        error,
      });
    }

    req.body = result.data;
    next();
  };
};
