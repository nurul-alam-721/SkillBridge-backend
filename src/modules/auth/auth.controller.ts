import { Request, Response } from "express";
import { authService } from "./auth.service";
import catchAsync from "../../helpers/catchAsync";
import { ApiError } from "../../helpers/globalErrorHandler";
import httpStatus from "http-status";

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const user = await authService.getCurrentUser(req.user.id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: "Current user fetched successfully",
    data: user,
  });
});

export const authController = {
  getCurrentUser
};