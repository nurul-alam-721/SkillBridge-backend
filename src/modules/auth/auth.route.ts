import express, { Router } from "express";
import { authController } from "./auth.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = express.Router();

router.get("/", auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), authController.getCurrentUser);

export const authRoutes: Router = router;
