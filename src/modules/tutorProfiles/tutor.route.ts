import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { TutorController } from "./tutor.controller";
import { TutorValidation } from "./tutor.validation";

const router: Router = express.Router();

router.get("/", TutorController.getAllTutors);

router.get(
  "/me/stats",
  auth(UserRole.TUTOR),
  TutorController.getTutorStats
);

router.get("/me", auth(UserRole.TUTOR), TutorController.getMyTutorProfile);

router.get("/:id", TutorController.getTutorById);

router.post(
  "/create-profile",
  auth(UserRole.TUTOR),
  validateRequest(TutorValidation.createTutorProfileSchema),
  TutorController.createTutorProfile
);

router.post(
  "/",
  auth(UserRole.TUTOR),
  validateRequest(TutorValidation.createTutorProfileSchema),
  TutorController.createTutorProfile
);

router.patch(
  "/me",
  auth(UserRole.TUTOR),
  validateRequest(TutorValidation.updateTutorProfileSchema),
  TutorController.updateTutorProfile
);

router.put(
  "/me",
  auth(UserRole.TUTOR),
  validateRequest(TutorValidation.updateTutorProfileSchema),
  TutorController.updateTutorProfile
);

export const tutorRoutes = router;
