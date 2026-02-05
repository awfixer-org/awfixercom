import { betterAuth } from "better-auth";
import {
  apiKey,
  admin,
  mcp,
  jwt,
  organization,
  oidcProvider,
  genericOAuth,
} from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";

export const auth = betterAuth({
  plugins: [
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
