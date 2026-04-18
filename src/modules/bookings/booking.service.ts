import { prisma } from "../../lib/prisma";
import { ApiError } from "../../helpers/globalErrorHandler";
import httpStatus from "http-status";
import { BookingStatus } from "@prisma/client";
import { CreateBookingPayload, BookingUserRole } from "./booking.interface";

const MAX_CAPACITY = 50;

const createBooking = async (
  studentId: string,
  payload: CreateBookingPayload
) => {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.availabilitySlot.findUnique({
      where: { id: payload.slotId },
    });

    if (!slot) {
      throw new ApiError(httpStatus.NOT_FOUND, "Slot not found");
    }

    const capacity = slot.maxCapacity ?? MAX_CAPACITY;
    const booked = slot.totalBookings ?? 0;

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

    await tx.booking.create({
      data: {
        studentId,
        tutorProfileId: payload.tutorProfileId,
        slotId: payload.slotId,
      },
    });

    const newTotal = booked + 1;

    await tx.availabilitySlot.update({
      where: { id: payload.slotId },
      data: {
        totalBookings: newTotal,
        isBooked: newTotal >= capacity,
      },
    });

    const booking = await tx.booking.findFirst({
      where: {
        studentId,
        slotId: payload.slotId,
      },
      include: {
        tutorProfile: {
          include: {
            user: true,
            category: true,
          },
        },
        slot: true,
      },
    });

    const review = await tx.review.findFirst({
      where: {
        studentId,
        tutorProfileId: booking!.tutorProfileId,
      },
    });

    return {
      ...booking,
      review: review || null,
    };
  });
};

const getMyBookings = async (userId: string, role: BookingUserRole) => {
  if (role === "STUDENT") {
    const bookings = await prisma.booking.findMany({
      where: { studentId: userId },
      include: {
        tutorProfile: {
          include: {
            user: true,
            category: true,
          },
        },
        slot: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const reviews = await prisma.review.findMany({
      where: { studentId: userId },
    });

    const reviewMap = new Map(
      reviews.map((r) => [r.tutorProfileId, r])
    );

    return bookings.map((b) => ({
      ...b,
      review: reviewMap.get(b.tutorProfileId) || null,
    }));
  }

  return prisma.booking.findMany({
    where: { tutorProfile: { userId } },
    include: {
      student: true,
      slot: true,
      tutorProfile: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
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

  const now = new Date();
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
    PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
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
      include: {
        tutorProfile: {
          include: {
            user: true,
          },
        },
        slot: true,
      },
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
            isBooked: newTotal >= (slot.maxCapacity ?? MAX_CAPACITY),
          },
        });
      }
    }

    const review = await tx.review.findFirst({
      where: {
        studentId: booking.studentId,
        tutorProfileId: booking.tutorProfileId,
      },
    });

    return {
      ...updated,
      review: review || null,
    };
  });
};

export const autoCompleteBookings = async () => {
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      slot: { endTime: { lt: now } },
    },
  });

  return Promise.all(
    bookings.map((b) =>
      prisma.booking.update({
        where: { id: b.id },
        data: { status: BookingStatus.COMPLETED },
      })
    )
  );
};

const getBookingById = async (id: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id },
    include: {
      student: true,
      tutorProfile: {
        include: {
          user: true,
          category: true,
        },
      },
      slot: true,
    },
  });

  const review = await prisma.review.findFirst({
    where: {
      studentId: booking.studentId,
      tutorProfileId: booking.tutorProfileId,
    },
  });

  return {
    ...booking,
    review: review || null,
  };
};

const cancelBooking = async (bookingId: string, studentId: string) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    });

    if (!booking) throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
    if (booking.studentId !== studentId)
      throw new ApiError(httpStatus.FORBIDDEN, "You can only cancel your own bookings");
    if (booking.status !== BookingStatus.PENDING)
      throw new ApiError(httpStatus.BAD_REQUEST, "Only pending (unpaid) bookings can be cancelled");

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    const slot = await tx.availabilitySlot.findUnique({
      where: { id: booking.slotId },
    });

    if (slot) {
      const newTotal = Math.max(0, (slot.totalBookings ?? 1) - 1);
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: {
          totalBookings: newTotal,
          isBooked: newTotal >= (slot.maxCapacity ?? MAX_CAPACITY),
        },
      });
    }

    return updated;
  });
};

export const BookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatusByTutor,
  cancelBooking,
  getBookingById,
};