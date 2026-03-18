import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../middlewares/globalErrorHandler";
import httpStatus from "http-status";

const MAX_CAPACITY = 50;

const createBooking = async (
  studentId: string,
  payload: { tutorProfileId: string; slotId: string }
) => {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.availabilitySlot.findUnique({
      where: { id: payload.slotId },
    });

    if (!slot) {
      throw new ApiError(httpStatus.NOT_FOUND, "Slot not found");
    }

    const capacity = slot.maxCapacity ?? MAX_CAPACITY;
    const booked   = slot.totalBookings ?? 0;

    if (booked >= capacity) {
      throw new ApiError(httpStatus.CONFLICT, "This slot is fully booked");
    }

    const existingBooking = await tx.booking.findFirst({
      where: {
        studentId,
        slotId: payload.slotId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
    });

    if (existingBooking) {
      throw new ApiError(httpStatus.CONFLICT, "You have already booked this slot");
    }

    // Create booking
    const booking = await tx.booking.create({
      data: {
        studentId,
        tutorProfileId: payload.tutorProfileId,
        slotId: payload.slotId,
      },
    });

    // Increment totalBookings, mark full if at capacity
    const newTotal = booked + 1;
    await tx.availabilitySlot.update({
      where: { id: payload.slotId },
      data: {
        totalBookings: newTotal,
        isBooked:      newTotal >= capacity,
      },
    });

    return booking;
  });
};

const getMyBookings = async (userId: string, role: "STUDENT" | "TUTOR") => {
  if (role === "STUDENT") {
    return prisma.booking.findMany({
      where: { studentId: userId },
      include: { tutorProfile: true, slot: true },
    });
  }
  return prisma.booking.findMany({
    where: { tutorProfile: { userId } },
    include: { student: true, slot: true },
  });
};

export const updateBookingStatusByTutor = async (
  bookingId: string,
  tutorProfileId: string,
  status: BookingStatus
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: true, tutorProfile: true },
  });

  if (!booking) throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  if (booking.tutorProfileId !== tutorProfileId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not allowed to update this booking");
  }

  const now           = new Date();
  const currentStatus = booking.status;

  if (
    currentStatus === BookingStatus.COMPLETED ||
    currentStatus === BookingStatus.CANCELLED
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Booking status can no longer be changed");
  }

  if (status === BookingStatus.CANCELLED && booking.slot.endTime <= now) {
    throw new ApiError(400, "Cannot cancel a booking after the session has ended");
  }

  const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    PENDING:   [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!allowedTransitions[currentStatus].includes(status)) {
    throw new ApiError(403, `Invalid status transition from ${currentStatus} to ${status}`);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (status === BookingStatus.CANCELLED) {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: booking.slotId },
      });
      if (slot) {
        const newTotal = Math.max(0, (slot.totalBookings ?? 1) - 1);
        await tx.availabilitySlot.update({
          where: { id: booking.slotId },
          data: {
            totalBookings: newTotal,
            isBooked:      newTotal >= (slot.maxCapacity ?? MAX_CAPACITY),
          },
        });
      }
    }

    return updated;
  });
};

export const autoCompleteBookings = async () => {
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: { status: BookingStatus.CONFIRMED, slot: { endTime: { lt: now } } },
  });
  return Promise.all(
    bookings.map((b) =>
      prisma.booking.update({ where: { id: b.id }, data: { status: BookingStatus.COMPLETED } })
    )
  );
};

const getBookingById = async (id: string) => {
  return prisma.booking.findUniqueOrThrow({
    where: { id },
    include: { student: true, tutorProfile: true, slot: true },
  });
};

export const BookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatusByTutor,
  getBookingById,
};