import { z } from "zod";

const createSlotSchema = z.object({
  body: z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    maxCapacity: z.number().optional(),
  }),
});

const updateSlotSchema = z.object({
  body: z.object({
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    maxCapacity: z.number().optional(),
  }),
});

export const AvailabilityValidation = {
  createSlotSchema,
  updateSlotSchema,
};
