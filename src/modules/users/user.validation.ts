import { z } from "zod";
import { UserStatus } from "@prisma/client";

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    phone: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export const UserValidation = {
  updateUserSchema,
};
