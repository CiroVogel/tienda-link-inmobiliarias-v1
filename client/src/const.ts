export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

function shouldUseLocalLogin() {
  if (import.meta.env.VITE_LOCAL_AUTH_ENABLED === "true") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  const isLocalHost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL?.trim();
  const appId = import.meta.env.VITE_APP_ID?.trim();

  return isLocalHost || !oauthPortalUrl || !appId;
}

// Generate login URL at runtime so redirect URI reflects the current origin.
// When local auth is active or OAuth config is incomplete, use the local login form.
export const getLoginUrl = () => {
  if (shouldUseLocalLogin()) {
    return "/admin-login";
  }

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL!.trim();
  const appId = import.meta.env.VITE_APP_ID!.trim();
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL("/app-auth", oauthPortalUrl);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
