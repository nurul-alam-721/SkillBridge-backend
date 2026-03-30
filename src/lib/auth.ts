import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import z from "zod";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    "https://skill-bridge-client-green.vercel.app",
    process.env.FRONTEND_URL!,
    "http://localhost:3000",
  ].filter(Boolean),

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
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
    useSecureCookies: true,
    defaultCookieAttributes: {
      secure: true,
      sameSite: "none",
      partitioned: true,
    },
  },
});
