import { Request, Response } from "express";
import httpStatus from "http-status";
import { AdminService } from "./admin.service";
import catchAsync from "../../helpers/catchAsync";

const getStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await AdminService.getStats();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Admin stats fetched successfully",
    data: stats,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const bookings = await AdminService.getAllBookings(page, limit);
  res.status(httpStatus.OK).json({
    success: true,
    message: "All bookings fetched successfully",
    data: bookings,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const users = await AdminService.getAllUsers(page, limit);
  res.status(httpStatus.OK).json({
    success: true,
    message: "All users fetched successfully",
    data: users,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = await AdminService.updateUserStatus(id as string, status);
  res.status(httpStatus.OK).json({
    success: true,
    message: `User ${status === "BANNED" ? "banned" : "activated"} successfully`,
    data: user,
  });
});

export const AdminController = {
  getStats,
  getAllBookings,
  getAllUsers,
  updateUserStatus,
};