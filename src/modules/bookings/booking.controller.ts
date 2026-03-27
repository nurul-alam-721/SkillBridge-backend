import { NextFunction, Request, Response } from "express";
import { autoCompleteBookings, BookingService } from "./booking.service";
import { ApiError } from "../../helpers/globalErrorHandler";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { get } from "node:http";

// Student creates booking
const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = req.user?.id!;
    const booking = await BookingService.createBooking(studentId, req.body);

    res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};



// Student or Tutor: get own bookings
const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id!;
    const role = req.user?.role!;

    const bookings = await BookingService.getMyBookings(
      userId,
      role === "STUDENT" ? "STUDENT" : "TUTOR",
    );

    res.status(200).json({
      success: true,
      message: "My bookings fetched successfully!",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};


export const updateBookingStatusByTutor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id as string;
    const { id: bookingId } = req.params;
    const { status } = req.body;

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      throw new ApiError(httpStatus.NOT_FOUND, "Tutor profile not found");
    }

    const booking = await BookingService.updateBookingStatusByTutor(
      bookingId as string,
      tutorProfile.id,
      status
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
export const autoCompleteBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await autoCompleteBookings();
    res.status(httpStatus.OK).json({
      success: true,
      message: "Bookings auto-completed successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};


// Get single booking
const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await BookingService.getBookingById(
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Booking fetched successfully!",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const BookingController = {
  createBooking,
  getMyBookings,
  updateBookingStatusByTutor,
  getBookingById,
};
