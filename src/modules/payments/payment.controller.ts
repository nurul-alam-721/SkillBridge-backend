import { Request, Response } from "express";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";
import catchAsync from "../../helpers/catchAsync";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id!;
  const { bookingId } = req.body;
  const result = await PaymentService.createPaymentIntent(studentId, bookingId);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Payment intent created successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id!;
  const { bookingId, paymentIntentId } = req.body;
  const result = await PaymentService.confirmPayment(studentId, bookingId, paymentIntentId);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Payment confirmed successfully",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Payments fetched successfully",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const role = req.user?.role!;
  const result = await PaymentService.getMyPayments(userId, role);

  res.status(httpStatus.OK).json({
    success: true,
    message: "My payments fetched successfully",
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
  getAllPayments,
  getMyPayments,
};
