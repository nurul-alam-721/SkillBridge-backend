import { z } from "zod";

const createTutorProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    hourlyRate: z.number(),
    experience: z.number(),
    categoryId: z.string(),
  }),
});

const updateTutorProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    hourlyRate: z.number().optional(),
    experience: z.number().optional(),
    categoryId: z.string().optional(),
  }),
});

export const TutorValidation = {
  createTutorProfileSchema,
  updateTutorProfileSchema,
};
