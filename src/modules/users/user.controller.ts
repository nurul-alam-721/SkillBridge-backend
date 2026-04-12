import { Request, Response } from "express";
import { userService } from "./user.service";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUsers();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.getById(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.updateStatus(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "User status/role updated successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const result = await userService.getById(userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const result = await userService.updateOwnProfile(userId, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const updateMyRole = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const result = await userService.updateMyRole(userId, req.body.role);
  res.status(httpStatus.OK).json({
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  getMyProfile,
  updateMyProfile,
  updateMyRole,
};
