import { z } from "zod";

const createPaymentIntentSchema = z.object({
  body: z.object({
    bookingId: z.string(),
  }),
});

const confirmPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string(),
    paymentIntentId: z.string().optional(),
  }),
});

export const PaymentValidation = {
  createPaymentIntentSchema,
  confirmPaymentSchema,
};
