import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router: Router = express.Router();

router.post(
  "/",
  auth(UserRole.STUDENT),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview
);

router.get(
  "/tutor/:tutorProfileId",
  ReviewController.getTutorReviews
);

router.get(
  "/me",
  auth(UserRole.STUDENT),
  ReviewController.getMyReviews
);

export const reviewRoutes = router;
