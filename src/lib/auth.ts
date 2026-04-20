import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import z from "zod";
import config from "../config";

export const auth = betterAuth({
  secret: config.better_auth_secret!,
  baseURL: config.better_auth_url!,
  trustedOrigins: [
    "https://skill-bridge-client-green.vercel.app",
    config.frontend_url!,
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
      clientId: config.google_client_id!,
      clientSecret: config.google_client_secret!,
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
    trustedProxyHeaders: true,
    defaultCookieAttributes: {
      secure: true,
      sameSite: "none",
      partitioned: true,
    },
  },
});
