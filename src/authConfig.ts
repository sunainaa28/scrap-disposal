import type { Configuration, PopupRequest } from "@azure/msal-browser";

// Check if we are running in mock authentication mode
const clientId = import.meta.env.VITE_MSAL_CLIENT_ID;
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID || 'common';
const redirectUri = import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin;

export const isMockAuth = !clientId || clientId === 'mock';

export const msalConfig: Configuration = {
  auth: {
    clientId: isMockAuth ? 'mock-client-id' : clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage",
  }
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ["User.Read"]
};

// Add scopes here for access token to be used at Microsoft identity platform endpoints.
export const tokenRequest = {
  scopes: ["User.Read"],
  forceRefresh: false
};
