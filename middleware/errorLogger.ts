import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { MulterError } from "multer";
import { AppError } from "../errors/AppError";

type Mapped = { status: number; message: string; expose: boolean };

// expose: is this message safe and useful to show the user?
const mapError = (err: unknown): Mapped => {
  if (err instanceof AppError) {
    return { status: err.statusCode, message: err.message, expose: true };
  }

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025":
        return { status: 404, message: "Resource not found", expose: true };
      case "P2002":
        return { status: 409, message: "That name is already taken", expose: true };
      case "P2003":
        return { status: 400, message: "Invalid reference", expose: true };
      default:
        return { status: 500, message: "Internal server error", expose: false };
    }
  }

  if (err instanceof MulterError) {
    return err.code === "LIMIT_FILE_SIZE"
      ? { status: 413, message: "File is too large", expose: true }
      : { status: 400, message: "Upload failed", expose: true };
  }

  return { status: 500, message: "Internal server error", expose: false };
};


export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  const { status, message, expose } = mapError(err);

  const log = status >= 500 ? console.error : console.warn;
  log(`[${status}] ${req.method} ${req.originalUrl}`, {
    userId: res.locals.currentUser?.id,
    error: err instanceof Error ? err.stack : err,
  });

  // Response already started (e.g. a stream failed mid-download).
  // Can't send a new status; hand to Express's default handler to close it.
  if (res.headersSent) return next(err);

  const body = expose ? message : "Internal server error";

  if (req.accepts("html")) {
    return res.status(status).render("pages/error", {status, message:body} );
  }
  return res.status(status).json({ message: body });
};