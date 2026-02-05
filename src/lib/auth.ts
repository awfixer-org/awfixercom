import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";
import {
  apiKey,
  admin,
  mcp,
  jwt,
  organization,
  oidcProvider,
  genericOAuth,
  oneTap,
  siwe,
  emailOTP,
  magicLink,
  twoFactor,
  multiSession,
  lastLoginMethod,
} from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: "awfixercom",
  plugins: [
    lastLoginMethod(),
    multiSession(),
    twoFactor(),
    magicLink({
      sendMagicLink: async ({ email, token, url }, ctx) => {
        // send email to user
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // Send the OTP for sign in
        } else if (type === "email-verification") {
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
        }
      },
    }),
    passkey(),
    siwe({
      domain: "example.com",
      emailDomainName: "example.com", // optional
      anonymous: false, // optional, default is true
      getNonce: async () => {
        // Implement your nonce generation logic here
        return "your-secure-random-nonce";
      },
      verifyMessage: async (args) => {
        // Implement your SIWE message verification logic here
        // This should verify the signature against the message
        return true; // return true if signature is valid
      },
      ensLookup: async (args) => {
        // Optional: Implement ENS lookup for user names and avatars
        return {
          name: "user.eth",
          avatar: "https://example.com/avatar.png",
        };
      },
    }),
    oneTap(),
    genericOAuth({
      config: [
        {
          providerId: "provider-id",
          clientId: "test-client-id",
          clientSecret: "test-client-secret",
          discoveryUrl:
            "https://auth.example.com/.well-known/openid-configuration",
          // ... other config options
        },
        // Add more providers as needed
      ],
    }),
    jwt(),
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/consent",
      // ...other options
    }),
    oidcProvider({
      loginPage: "/sign-in",
    }),
    organization(),
    mcp({ loginPage: "/sign-in" }),
    admin(),
    apiKey(),
  ],
});
