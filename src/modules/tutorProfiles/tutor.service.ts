import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";
import { ApiError } from "../../helpers/globalErrorHandler";
import { TutorSortableFields } from "../../types/types";
import { Prisma, UserStatus } from "@prisma/client";

export interface TutorProfileData {
  bio?: string;
  hourlyRate: number;
  experience: number;
  categoryId: string;
}

export type GetAllTutorsParams = {
  search?: string;
  categoryId?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  minExperience?: number;
  availableDate?: string;
  page: number;
  limit: number;
  skip: number;
  sortBy: TutorSortableFields;
  sortOrder: "asc" | "desc";
};

const createTutorProfile = async (userId: string, data: TutorProfileData) => {
  if (!userId) throw new Error("User not logged in");
  const existing = await prisma.tutorProfile.findUnique({ where: { userId } });
  if (existing) throw new ApiError(400, "Profile already exists");

  return prisma.tutorProfile.create({
    data: {
      userId,
      bio: data.bio || "No bio provided",
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      categoryId: data.categoryId,
    },
    include: { user: true, category: true, availability: true, reviews: true },
  });
};

const updateTutorProfile = async (
  userId: string,
  data: Partial<TutorProfileData>,
) => {
  if (!userId) throw new Error("User not logged in");

  const updateData: any = {};
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
  if (data.experience !== undefined) updateData.experience = data.experience;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

  return prisma.tutorProfile.update({
    where: { userId },
    data: updateData,
    include: { user: true, category: true, availability: true, reviews: true },
  });
};

const getMyProfile = async (userId: string) => {
  return prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      category: true,
      availability: true,
      reviews: {
        include: {
          student: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

const getAllTutors = async (params: GetAllTutorsParams) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = params.skip !== undefined ? Number(params.skip) : (page - 1) * limit;
  
  const minRate = params.minRate !== undefined ? Number(params.minRate) : undefined;
  const maxRate = params.maxRate !== undefined ? Number(params.maxRate) : undefined;
  const minRating = params.minRating !== undefined ? Number(params.minRating) : undefined;
  const minExperience = params.minExperience !== undefined ? Number(params.minExperience) : undefined;

  if (limit <= 0) {
    throw new ApiError(400, "Limit must be a positive integer");
  }

  const {
    search,
    categoryId,
    availableDate,
    sortBy,
    sortOrder,
  } = params;

  const andConditions: Prisma.TutorProfileWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { bio: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (categoryId) andConditions.push({ categoryId });

  if (minRate !== undefined || maxRate !== undefined) {
    andConditions.push({
      hourlyRate: {
        ...(minRate !== undefined && { gte: minRate }),
        ...(maxRate !== undefined && { lte: maxRate }),
      },
    });
  }

  if (minRating !== undefined)
    andConditions.push({ rating: { gte: minRating } });
  if (minExperience !== undefined)
    andConditions.push({ experience: { gte: minExperience } });

  if (availableDate) {
    andConditions.push({
      availability: {
        some: { date: new Date(availableDate), isBooked: false },
      },
    });
  }

  const whereCondition: Prisma.TutorProfileWhereInput = {
    ...(andConditions.length > 0 && { AND: andConditions }),
    user: { role: UserRole.TUTOR, status: UserStatus.ACTIVE },
  };

  const [tutors, totalTutors] = await Promise.all([
    prisma.tutorProfile.findMany({
      take: limit,
      skip,
      where: whereCondition,
      include: {
        user: true,
        category: true,
        availability: true,
        reviews: true,
      },
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.tutorProfile.count({ where: whereCondition }),
  ]);

  return {
    tutors,
    pagination: {
      totalTutors,
      page,
      limit,
      totalPages: Math.ceil(totalTutors / limit),
    },
  };
};

const getTutorById = async (tutorId: string) => {
  return prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    include: {
      user: true,
      category: true,
      availability: true,
      reviews: {
        include: {
          student: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

const getTutorStats = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      category: true,
      user: {
        select: { id: true, name: true, email: true, image: true, phone: true },
      },
      bookings: {
        include: {
          slot: true,
          student: {
            select: { id: true, name: true, image: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: {
          student: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      availability: true,
    },
  });

  if (!tutorProfile) throw new ApiError(404, "Tutor profile not found");

  const { bookings, reviews, availability } = tutorProfile;

  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const upcoming = bookings.filter((b) =>
    ["PENDING", "CONFIRMED"].includes(b.status),
  );
  const cancelled = bookings.filter((b) => b.status === "CANCELLED");

  const stats = {
    totalSessions: bookings.length,
    upcoming: upcoming.length,
    completed: completed.length,
    cancelled: cancelled.length,
    totalEarnings: completed.length * tutorProfile.hourlyRate,
    availableSlots: availability.filter((s) => !s.isBooked).length,
    rating: tutorProfile.rating,
    totalReviews: tutorProfile.totalReviews,
  };

  return {
    stats,
    tutorProfile,
    recentBookings: bookings.slice(0, 10),
    recentReviews: reviews.slice(0, 5),
  };
};

export const tutorService = {
  createTutorProfile,
  updateTutorProfile,
  getMyProfile,
  getAllTutors,
  getTutorById,
  getTutorStats,
};
