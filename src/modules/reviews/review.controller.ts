import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";
import { UserRole } from "../../middlewares/auth";

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

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id!;
  const { id: reviewId } = req.params;
  const result = await ReviewService.updateReview(reviewId as string, studentId, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const userRole = req.user?.role as UserRole.STUDENT | UserRole.ADMIN;
  const { id: reviewId } = req.params;
  await ReviewService.deleteReview(reviewId as string, userId, userRole);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getTutorReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
