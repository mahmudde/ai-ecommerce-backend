import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { env } from "../config/env.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

   trustedOrigins: [
    env.CLIENT_URL,
    env.SERVER_URL,
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
  ],

  advanced: {
  disableCSRFCheck: env.NODE_ENV === "development",
},

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
    facebook:
      process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
        ? {
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }
        : undefined,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
      status: {
        type: "string",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      street: {
        type: "string",
        required: false,
      },
      city: {
        type: "string",
        required: false,
      },
      country: {
        type: "string",
        required: false,
      },
      postalCode: {
        type: "string",
        required: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type AuthSession = typeof auth.$Infer.Session;