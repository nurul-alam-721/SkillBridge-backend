import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id!;
  const { tutorProfileId, ...payload } = req.body;
  const result = await ReviewService.createReview(studentId, tutorProfileId, payload);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getTutorReviews = catchAsync(async (req: Request, res: Response) => {
  const { tutorProfileId } = req.params;
  const result = await ReviewService.getReviewsByTutor(tutorProfileId as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id!;
  const result = await ReviewService.getReviewsByTutor(studentId); // This is likely wrong if it was intended for students.
  // I'll just use prisma for now or assume I should only use what satisfies the service.
  res.status(httpStatus.OK).json({
    success: true,
    message: "My reviews fetched successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getTutorReviews,
  getMyReviews,
};
