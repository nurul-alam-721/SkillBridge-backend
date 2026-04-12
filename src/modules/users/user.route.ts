import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router: Router = express.Router();

router.get(
  "/me",
  auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
  UserController.getMyProfile
);

router.put(
  "/me",
  auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
  validateRequest(UserValidation.updateUserSchema),
  UserController.updateMyProfile
);

router.patch(
  "/me/role",
  auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
  UserController.updateMyRole
);

router.get("/", auth(UserRole.ADMIN), UserController.getAllUsers);

router.get("/:id", auth(UserRole.ADMIN), UserController.getUserById);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserSchema),
  UserController.updateUser
);

export const userRoutes = router;