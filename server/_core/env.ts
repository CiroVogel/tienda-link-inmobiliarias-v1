const isProduction = process.env.NODE_ENV === "production";
const adminEmail =
  process.env.ADMIN_EMAIL?.trim() || (!isProduction ? "admin@inmobiliarias.local" : "");
const adminPassword = process.env.ADMIN_PASSWORD ?? (!isProduction ? "Admin12345!" : "");
const localAuthEnabled =
  process.env.LOCAL_AUTH_ENABLED === "true" ||
  (!isProduction && (!process.env.OAUTH_SERVER_URL?.trim() || !process.env.VITE_APP_ID?.trim()));

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret:
    process.env.JWT_SECRET ?? (!isProduction ? "inmobiliarias-local-cookie-secret" : ""),
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  whatsappMetaAccessToken: process.env.WHATSAPP_META_ACCESS_TOKEN ?? "",
  whatsappMetaPhoneNumberId: process.env.WHATSAPP_META_PHONE_NUMBER_ID ?? "",
  whatsappMetaApiBaseUrl: process.env.WHATSAPP_META_API_BASE_URL ?? "https://graph.facebook.com",
  whatsappMetaGraphVersion: process.env.WHATSAPP_META_GRAPH_VERSION ?? "v23.0",
  whatsappMetaTemplateLanguageCode: process.env.WHATSAPP_META_TEMPLATE_LANGUAGE_CODE ?? "es_AR",
  whatsappMetaClientPaymentTemplateName:
    process.env.WHATSAPP_META_CLIENT_PAYMENT_TEMPLATE_NAME ?? "",
  whatsappMetaOwnerPaymentTemplateName:
    process.env.WHATSAPP_META_OWNER_PAYMENT_TEMPLATE_NAME ?? "",
  // Local auth (dev): if OAuth config is missing, fall back to local admin.
  localAuthEnabled,
  adminEmail,
  adminPassword,
};
