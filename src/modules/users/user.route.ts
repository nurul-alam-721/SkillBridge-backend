import express, { Router } from "express";
import { userController } from "./user.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = express.Router();

router.get("/", auth(UserRole.ADMIN), userController.getAllUsers);

router.put(
  "/me",
  auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR),
  userController.updateMyProfile
);




export const userRoutes: Router = router;
