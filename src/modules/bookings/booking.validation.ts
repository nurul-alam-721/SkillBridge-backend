import { z } from "zod";
import { BookingStatus } from "@prisma/client";

const createBookingSchema = z.object({
  body: z.object({
    tutorProfileId: z.string(),
    slotId: z.string(),
  }),
});

const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus),
  }),
});

export const BookingValidation = {
  createBookingSchema,
  updateBookingStatusSchema,
};
