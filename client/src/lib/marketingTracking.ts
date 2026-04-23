type TrackingValue = string | number | boolean;
type TrackingParams = Record<string, TrackingValue>;

export type LandingEventName =
  | "page_view"
  | "cta_primary_click"
  | "whatsapp_click"
  | "instagram_click"
  | "email_click"
  | "facebook_click"
  | "payment_click"
  | "demo_click"
  | "how_it_works_click";

export type LandingClickEventName = Exclude<LandingEventName, "page_view">;

type Gtag = (...args: unknown[]) => void;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
    __mwsGaInitialized?: boolean;
    __mwsMetaInitialized?: boolean;
  }
}

const ga4Id = import.meta.env.VITE_GA4_ID?.trim();
const metaPixelId = import.meta.env.VITE_META_PIXEL_ID?.trim();
const GA_SCRIPT_ID = "mws-ga4-script";
const META_SCRIPT_ID = "mws-meta-pixel-script";

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

const loadScript = (id: string, src: string) => {
  if (!isBrowser() || document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

const cleanParams = (params?: TrackingParams) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined),
  ) as TrackingParams;

const initGa4 = () => {
  if (!isBrowser() || !ga4Id || window.__mwsGaInitialized) return;

  window.dataLayer = window.dataLayer || [];
if (!window.gtag) {
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  } as unknown as Gtag;
}

  loadScript(
    GA_SCRIPT_ID,
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`,
  );

  window.gtag("js", new Date());
  window.gtag("config", ga4Id, { send_page_view: false });
  window.__mwsGaInitialized = true;
};

const initMetaPixel = () => {
  if (!isBrowser() || !metaPixelId || window.__mwsMetaInitialized) return;

  if (!window.fbq) {
    const fbq: Fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }

      fbq.queue = fbq.queue || [];
      fbq.queue.push(args);
    }) as Fbq;

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = (...args: unknown[]) => fbq(...args);
    window.fbq = fbq;
  }

  loadScript(META_SCRIPT_ID, "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", metaPixelId);
  window.__mwsMetaInitialized = true;
};

const initLandingTracking = () => {
  if (!ga4Id && !metaPixelId) return;

  initGa4();
  initMetaPixel();
};

export const trackLandingPageView = () => {
  if (!isBrowser()) return;

  initLandingTracking();

  const pageData = {
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
    page_title: document.title,
  };

  if (ga4Id && window.gtag) {
    window.gtag("event", "page_view", pageData);
  }

  if (metaPixelId && window.fbq) {
    window.fbq("track", "PageView");
  }
};

export const trackLandingEvent = (
  eventName: LandingClickEventName,
  params?: TrackingParams,
) => {
  if (!isBrowser()) return;

  initLandingTracking();

  const eventParams = cleanParams(params);

  if (ga4Id && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }

  if (metaPixelId && window.fbq) {
    window.fbq("trackCustom", eventName, eventParams);
  }
};
