import { Request, Response } from "express";
import { tutorService } from "./tutor.service";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";

const createTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const result = await tutorService.createTutorProfile(userId, req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Tutor profile created successfully",
    data: result,
  });
});

const getAllTutors = catchAsync(async (req: Request, res: Response) => {
  const result = await tutorService.getAllTutors(req.query as any);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tutors fetched successfully",
    data: result,
  });
});

const getTutorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await tutorService.getTutorById(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tutor fetched successfully",
    data: result,
  });
});

const updateTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const result = await tutorService.updateTutorProfile(userId, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tutor profile updated successfully",
    data: result,
  });
});

const getMyTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const result = await tutorService.getMyProfile(userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tutor profile fetched successfully",
    data: result,
  });
});

const getTutorStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const result = await tutorService.getTutorStats(userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tutor stats fetched successfully",
    data: result,
  });
});

export const TutorController = {
  createTutorProfile,
  getAllTutors,
  getTutorById,
  updateTutorProfile,
  getMyTutorProfile,
  getTutorStats,
};
