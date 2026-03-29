import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import z from "zod";
import { oAuthProxy } from "better-auth/plugins";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL!,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    process.env.FRONTEND_URL!,
    "http://localhost:3000",
    "https://skill-bridge-client-green.vercel.app",
     process.env.BETTER_AUTH_URL!
  ].filter(Boolean),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false,
        input: true,
        validator: {
          input: z.enum(["STUDENT", "TUTOR", "ADMIN"]),
        },
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
        input: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },

  advanced: {
    cookies: {
      session_token: {
        name: "session_token",
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true,
        },
      },
    },
  },

  plugins: [oAuthProxy()],
});