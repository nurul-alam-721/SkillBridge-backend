import { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { UserRole } from "../../middlewares/auth";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Alll Users fetched successfully!",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    const { name, phone, image } = req.body;

    const result = await userService.updateOwnProfile(userId, {
      name,
      phone,
      image,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const updateMyRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;

    if (!["STUDENT", "TUTOR"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await userService.updateMyRole(req?.user?.id as string, role as UserRole); 

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const userController = {
  getAllUsers,
  updateMyProfile,
  updateMyRole,
};
