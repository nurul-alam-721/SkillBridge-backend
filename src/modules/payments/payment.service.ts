import httpStatus from "http-status";
import { ApiError } from "../../helpers/globalErrorHandler";
import { prisma } from "../../lib/prisma";
import { PaymentUtils } from "./payment.utils";
import { BookingStatus, PaymentStatus } from "@prisma/client";

const createPaymentIntent = async (studentId: string, bookingId: string) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tutorProfile: true,
      },
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.studentId !== studentId) {
      throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to pay for this booking");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Booking is not in a payable state");
    }

    const amount = booking.tutorProfile.hourlyRate;

    const stripeIntent = await PaymentUtils.createStripePaymentIntent(amount, "bdt");

    const payment = await prisma.payment.upsert({
      where: { bookingId },
      update: {
        amount,
        transactionId: stripeIntent.id,
        status: PaymentStatus.PENDING,
      },
      create: {
        bookingId,
        studentId,
        amount,
        transactionId: stripeIntent.id,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      clientSecret: stripeIntent.client_secret,
      payment,
    };
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Internal Server Error");
  }
};

const confirmPayment = async (studentId: string, bookingId: string, paymentIntentId?: string) => {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment record not found");
  }

  if (payment.studentId !== studentId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  const idToVerify = paymentIntentId || payment.transactionId;

  if (!idToVerify) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment intent ID is missing");
  }

  const stripeIntent = await PaymentUtils.verifyPaymentIntent(idToVerify);

  if (stripeIntent.status !== "succeeded") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment has not succeeded on Stripe");
  }

  return await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { bookingId },
      data: {
        status: PaymentStatus.COMPLETED,
        paymentMethod: stripeIntent.payment_method as string,
      },
    });

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
      },
    });

    return {
      payment: updatedPayment,
      booking: updatedBooking,
    };
  });
};

const getAllPayments = async () => {
  return await prisma.payment.findMany({
    include: {
      student: true,
      booking: {
        include: {
          tutorProfile: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
};

const getMyPayments = async (userId: string, role: string) => {
  if (role === "STUDENT") {
    return await prisma.payment.findMany({
      where: { studentId: userId },
      include: {
        booking: {
          include: {
            tutorProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (role === "TUTOR") {
    return await prisma.payment.findMany({
      where: {
        booking: {
          tutorProfile: {
            userId: userId,
          },
        },
      },
      include: {
        student: true,
        booking: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
  return [];
};

export const PaymentService = {
  createPaymentIntent,
  confirmPayment,
  getAllPayments,
  getMyPayments,
};
