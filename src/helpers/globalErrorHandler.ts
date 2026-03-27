import { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated";

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let error: any = undefined;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid or missing fields in request";
    error = err.message;
  }

  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    message = "Database request error";

    if (err.code === "P2025") message = "Record not found";
    if (err.code === "P2002") message = "Duplicate key error";
    if (err.code === "P2003") message = "Foreign key constraint failed";

    error = {
      code: err.code,
      meta: err.meta,
    };
  }

  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Generic errors
  else if (err instanceof Error) {
    message = err.message || message;
    if (process.env.NODE_ENV !== "production") {
      error = err.stack;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

export default errorHandler;
