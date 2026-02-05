import { createAuthClient } from "better-auth/react";
import {
  apiKeyClient,
  adminClient,
  mcpClient,
  jwtClient,
  organizationClient,
  oidcProviderClient,
  genericOAuthClient,
  oneTapClient,
  siweClient,
  emailOTPClient,
  magicLinkClient,
  twoFactorClient,
  multiSessionClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    lastLoginMethodClient(),
    multiSessionClient(),
    twoFactorClient(),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    siweClient(),
    oneTapClient(),
    genericOAuthClient(),
    jwtClient(),
    oauthProviderClient(),
    oidcProviderClient(),
    organizationClient(),
    mcpClient(),
    adminClient(),
    apiKeyClient(),
  ],
});
