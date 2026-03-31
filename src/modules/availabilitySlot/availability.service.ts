import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../helpers/globalErrorHandler";

const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const WORKING_HOUR_START = 9;
const WORKING_HOUR_END = 16;
const MIN_SLOT_HOURS = 1;

const validateTimeFormat = (time: string): void => {
  if (!TIME_24H_REGEX.test(time)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Time must be in 24-hour HH:mm format (e.g. 14:00)"
    );
  }
};

const buildDateTime = (date: string, time: string): Date => {
  const [hourStr = "0", minuteStr = "0"] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const createAvailabilitySlot = async (
  tutorProfileId: string,
  payload: {
    date: string;
    startTime: string;
    endTime: string;
  }
) => {
  validateTimeFormat(payload.startTime);
  validateTimeFormat(payload.endTime);

  const start = buildDateTime(payload.date, payload.startTime);
  const end = buildDateTime(payload.date, payload.endTime);

  if (start <= new Date()) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot create availability in the past"
    );
  }

  if (end <= start) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "End time must be after start time"
    );
  }

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (durationHours < MIN_SLOT_HOURS) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Availability slot must be at least 1 hour"
    );
  }

  if (
    start.getHours() < WORKING_HOUR_START ||
    end.getHours() > WORKING_HOUR_END
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Availability must be between 09:00 AM and 04:00 PM"
    );
  }

  const overlap = await prisma.availabilitySlot.findFirst({
    where: {
      tutorProfileId,
      date: new Date(payload.date),
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (overlap) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Availability slot overlaps with an existing slot"
    );
  }

  return prisma.availabilitySlot.create({
    data: {
      tutorProfileId,
      date: new Date(payload.date),
      startTime: start,
      endTime: end,
    },
  });
};

const getTutorSlots = async (tutorProfileId: string) => {
  return prisma.availabilitySlot.findMany({
    where: { tutorProfileId },
    include: {
      bookings: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
};

const deleteSlot = async (slotId: string, tutorProfileId: string) => {
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
    include: {
      bookings: true,
    },
  });

  if (!slot) {
    throw new ApiError(httpStatus.NOT_FOUND, "Slot not found");
  }

  if (slot.tutorProfileId !== tutorProfileId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this slot"
    );
  }

  if (slot.bookings.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This slot already has student bookings and cannot be deleted"
    );
  }

  await prisma.availabilitySlot.delete({
    where: { id: slotId },
  });

  return null;
};

const getPublicSlotsByTutor = async (
  tutorProfileId: string,
  date?: string
) => {
  return prisma.availabilitySlot.findMany({
    where: {
      tutorProfileId,
      isBooked: false,
      startTime: { gt: new Date() },
      ...(date && { date: new Date(date) }),
    },
    include: {
      tutorProfile: {
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          bio: true,
          hourlyRate: true,
          experience: true,
          rating: true,
          totalReviews: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
};

const getSlotsByTutorGroupedByDate = async (tutorProfileId: string) => {
  const slots = await prisma.availabilitySlot.findMany({
    where: {
      tutorProfileId,
      isBooked: false,
      startTime: { gt: new Date() },
    },
    orderBy: { startTime: "asc" },
  });

  const grouped = slots.reduce<Record<string, typeof slots>>((acc, slot) => {
    const dateKey = slot.date.toISOString().split("T")[0] ?? "";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey]!.push(slot);
    return acc;
  }, {});

  return grouped;
};

export const AvailabilityService = {
  createAvailabilitySlot,
  getTutorSlots,
  deleteSlot,
  getPublicSlotsByTutor,
  getSlotsByTutorGroupedByDate,
};