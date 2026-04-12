import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router: Router = express.Router();

router.post(
  "/create-intent",
  auth(UserRole.STUDENT),
  validateRequest(PaymentValidation.createPaymentIntentSchema),
  PaymentController.createPaymentIntent
);

router.post(
  "/confirm",
  auth(UserRole.STUDENT),
  validateRequest(PaymentValidation.confirmPaymentSchema),
  PaymentController.confirmPayment
);

router.get(
  "/",
  auth(UserRole.ADMIN),
  PaymentController.getAllPayments
);

router.get(
  "/me",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  PaymentController.getMyPayments
);

export const paymentRoutes = router;
