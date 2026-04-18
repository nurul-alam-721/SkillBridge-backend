import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";
import { ApiError } from "../../helpers/globalErrorHandler";
import httpStatus from "http-status";
import { ReviewPayload } from "./review.interface";

const createReview = async (
  studentId: string,
  tutorProfileId: string,
  payload: ReviewPayload
) => {
  const rating = Number(payload.rating);

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Rating must be between 1 and 5"
    );
  }

  const confirmedBooking = await prisma.booking.findFirst({
    where: {
      studentId,
      tutorProfileId,
      status: {
        in: ["CONFIRMED", "COMPLETED"],
      },
    },
  });

  if (!confirmedBooking) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only review tutors with confirmed or completed bookings"
    );
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        studentId,
        tutorProfileId,
        rating, 
        comment: payload.comment ?? null,
      },
    });

    const stats = await tx.review.aggregate({
      where: { tutorProfileId },
      _avg: { rating: true },
      _count: { rating: true },
    });

  
    const avgRating = Number(stats._avg.rating ?? 0);

    await tx.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: stats._count.rating,
      },
    });

    return review;
  });
};


const updateReview = async (
  reviewId: string,
  studentId: string,
  payload: ReviewPayload
) => {
  const rating = Number(payload.rating);

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Rating must be between 1 and 5"
    );
  }

  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.studentId !== studentId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only update your own review"
      );
    }

    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: payload.comment || null,
      },
    });

    const tutorReviews = await tx.review.findMany({
      where: { tutorProfileId: review.tutorProfileId },
    });

    const totalReviews = tutorReviews.length;

    const avgRating =
      tutorReviews.reduce((acc, r) => acc + Number(r.rating), 0) / totalReviews;

    await tx.tutorProfile.update({
      where: { id: review.tutorProfileId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews,
      },
    });

    return updatedReview;
  });
};


const deleteReview = async (
  reviewId: string,
  userId: string,
  userRole: UserRole.STUDENT | UserRole.ADMIN
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (userRole === UserRole.STUDENT && review.studentId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only delete your own review"
    );
  }

  await prisma.review.delete({ where: { id: reviewId } });

  const tutorReviews = await prisma.review.findMany({
    where: { tutorProfileId: review.tutorProfileId },
  });

  const totalReviews = tutorReviews.length;
  const avgRating =
  totalReviews > 0
    ? tutorReviews.reduce((acc, r) => acc + Number(r.rating), 0) / totalReviews
    : 0;

  await prisma.tutorProfile.update({
    where: { id: review.tutorProfileId },
    data: {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews,
    },
  });

  return null;
};

const getReviewsByTutor = async (tutorProfileId: string) => {
  return prisma.review.findMany({
    where: { tutorProfileId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const ReviewService = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByTutor,
};
