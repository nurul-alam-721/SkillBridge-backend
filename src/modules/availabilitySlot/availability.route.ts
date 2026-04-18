import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AvailabilityController } from "./availability.controller";
import { AvailabilityValidation } from "./availability.validation";

const router: Router = express.Router();

router.post(
  "/",
  auth(UserRole.TUTOR),
  validateRequest(AvailabilityValidation.createSlotSchema),
  AvailabilityController.createSlot
);

router.get(
  "/",
  auth(UserRole.TUTOR),
  AvailabilityController.getMySlots
);

router.get(
  "/me",
  auth(UserRole.TUTOR),
  AvailabilityController.getMySlots
);

router.get(
  "/tutor/:tutorProfileId",
  AvailabilityController.getTutorSlots
);

router.patch(
  "/:id",
  auth(UserRole.TUTOR),
  validateRequest(AvailabilityValidation.updateSlotSchema),
  AvailabilityController.updateSlot
);

router.delete(
  "/:id",
  auth(UserRole.TUTOR),
  AvailabilityController.deleteSlot
);

export const AvailabilityRoutes = router;