import { z } from "zod";

const createReviewSchema = z.object({
  body: z.object({
    tutorProfileId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
};
