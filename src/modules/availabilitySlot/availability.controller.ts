import { Request, Response } from "express";
import { AvailabilityService } from "./availability.service";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../helpers/globalErrorHandler";

const createSlot = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId }
  });

  if (!tutorProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tutor profile not found");
  }

  const result = await AvailabilityService.createAvailabilitySlot(tutorProfile.id, req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Availability slot created successfully",
    data: result,
  });
});

const getMySlots = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId }
  });

  if (!tutorProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tutor profile not found");
  }

  const result = await AvailabilityService.getTutorSlots(tutorProfile.id);
  res.status(httpStatus.OK).json({
    success: true,
    message: "My availability slots fetched successfully",
    data: result,
  });
});

const getTutorSlots = catchAsync(async (req: Request, res: Response) => {
  const { tutorProfileId } = req.params;
  const result = await AvailabilityService.getTutorSlots(tutorProfileId as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Tutor availability slots fetched successfully",
    data: result,
  });
});

const deleteSlot = catchAsync(async (req: Request, res: Response) => {
  const { id: slotId } = req.params;
  const userId = req.user?.id!;
  
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId }
  });

  if (!tutorProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tutor profile not found");
  }

  await AvailabilityService.deleteSlot(slotId as string, tutorProfile.id);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Availability slot deleted successfully",
    data: null,
  });
});

export const AvailabilityController = {
  createSlot,
  getMySlots,
  getTutorSlots,
  deleteSlot,
};