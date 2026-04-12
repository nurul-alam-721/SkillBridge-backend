import { z } from "zod";

const createCategorySchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema,
};
