import Stripe from "stripe";
import config from "../../config";

const stripe = new Stripe(config.stripe_secret_key as string);

const createStripePaymentIntent = async (amount: number, currency: string = "bdt") => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    payment_method_types: ["card"],
  });
  return paymentIntent;
};

const verifyPaymentIntent = async (paymentIntentId: string) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

export const PaymentUtils = {
  createStripePaymentIntent,
  verifyPaymentIntent,
};
