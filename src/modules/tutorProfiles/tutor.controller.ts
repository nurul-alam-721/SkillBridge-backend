import { NextFunction, Request, Response } from "express";
import { paginationSortingHelper } from "../../helpers/paginationSortingHelper";
import { GetAllTutorsParams, tutorService } from "./tutor.service";
import { TutorSortableFields } from "../../types/types";

const createTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const profile = await tutorService.createTutorProfile(
      userId as string,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Tutor profile created successfully!",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const profile = await tutorService.updateTutorProfile(
      userId as string,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully!",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const profile = await tutorService.getMyProfile(userId as string);
    res.status(200).json({
      success: true,
      message: profile
        ? "Tutor profile fetched successfully!"
        : "No profile found",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTutors = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const categoryId =
      typeof req.query.categoryId === "string"
        ? req.query.categoryId
        : undefined;
    const minRate =
      typeof req.query.minRate === "string"
        ? Number(req.query.minRate)
        : undefined;
    const maxRate =
      typeof req.query.maxRate === "string"
        ? Number(req.query.maxRate)
        : undefined;
    const minRating =
      typeof req.query.minRating === "string"
        ? Number(req.query.minRating)
        : undefined;
    const minExperience =
      typeof req.query.minExperience === "string"
        ? Number(req.query.minExperience)
        : undefined;
    const availableDate =
      typeof req.query.availableDate === "string"
        ? req.query.availableDate
        : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query as Record<string, unknown>,
    );

    const params: GetAllTutorsParams = {
      page,
      limit,
      skip,
      sortBy: sortBy as TutorSortableFields,
      sortOrder,
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(minRate !== undefined && { minRate }),
      ...(maxRate !== undefined && { maxRate }),
      ...(minRating !== undefined && { minRating }),
      ...(minExperience !== undefined && { minExperience }),
      ...(availableDate && { availableDate }),
    };

    const result = await tutorService.getAllTutors(params);
    res
      .status(200)
      .json({
        success: true,
        message: "Tutors fetched successfully!",
        ...result,
      });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "Getting tutors failed", error });
  }
};

const getTutorById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const tutor = await tutorService.getTutorById(id as string);
    res
      .status(200)
      .json({
        success: true,
        message: "Tutor fetched successfully!",
        data: tutor,
      });
  } catch (error) {
    next(error);
  }
};

const getTutorStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const data = await tutorService.getTutorStats(userId as string);
    res
      .status(200)
      .json({
        success: true,
        message: "Tutor stats fetched successfully!",
        data,
      });
  } catch (error) {
    next(error);
  }
};

export const tutorController = {
  createTutorProfile,
  updateTutorProfile,
  getMyProfile,
  getAllTutors,
  getTutorById,
  getTutorStats,
};
