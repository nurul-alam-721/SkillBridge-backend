import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { BookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";

const router: Router = express.Router();

router.post(
  "/",
  auth(UserRole.STUDENT),
  validateRequest(BookingValidation.createBookingSchema),
  BookingController.createBooking
);


router.get(
  "/me",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  BookingController.getMyBookings
);

router.put(
  "/:id/status",
  auth(UserRole.TUTOR),
  validateRequest(BookingValidation.updateBookingStatusSchema),
  BookingController.updateBookingStatusByTutor
);

router.get(
  "/:id",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  BookingController.getBookingById
);


export const bookingRoutes = router;
