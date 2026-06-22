import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import { getPublicProperty, getStoredBusinessProfile } from "./storage";

// Template is read once and cached. If dist/public/index.html is not available
// (e.g. in development without a prior build), the middleware silently calls next().
let cachedTemplate: string | null = null;
let templateLoadAttempted = false;

function resolveDistPublicPath(): string {
  // In production, esbuild bundles server to dist/index.js → import.meta.dirname = dist/
  // The Vite client build lives at dist/public/
  // In development, this path won't exist; loadTemplate() handles the error gracefully.
  if (process.env.NODE_ENV === "development") {
    return path.resolve(import.meta.dirname, "..", "dist", "public");
  }
  return path.resolve(import.meta.dirname, "public");
}

function loadTemplate(): string | null {
  if (templateLoadAttempted) return cachedTemplate;
  templateLoadAttempted = true;

  try {
    const templatePath = path.resolve(resolveDistPublicPath(), "index.html");
    cachedTemplate = fs.readFileSync(templatePath, "utf-8");
    return cachedTemplate;
  } catch {
    console.error(
      "[OG] Could not load dist/public/index.html — property Open Graph injection disabled. " +
        "Run `pnpm build` first to enable it.",
    );
    return null;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getRequestOrigin(req: Request): string {
  const forwardedProto = req.get("x-forwarded-proto");
  const proto =
    forwardedProto === "https" || req.protocol === "https" ? "https" : "http";
  const host = req.get("host") ?? "localhost";
  return `${proto}://${host}`;
}

function resolveAbsoluteImageUrl(rawUrl: string, origin: string): string {
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  const normalized = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return `${origin}${normalized}`;
}

function buildOgMetaTags(params: {
  title: string;
  businessName: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string | null;
}): string {
  const { title, businessName, description, canonicalUrl, imageUrl } = params;

  const safeTitle = escapeHtml(title);
  const safeBusinessName = escapeHtml(businessName);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonicalUrl);
  const fullTitle = `${safeTitle} | ${safeBusinessName}`;

  const imageTags = imageUrl
    ? `\n<meta property="og:image" content="${escapeHtml(imageUrl)}" />\n<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`
    : "";

  return `<title>${fullTitle}</title>
<meta name="description" content="${safeDescription}" />
<link rel="canonical" href="${safeCanonical}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${safeBusinessName}" />
<meta property="og:title" content="${fullTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:url" content="${safeCanonical}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${fullTitle}" />
<meta name="twitter:description" content="${safeDescription}" />${imageTags}`;
}

function injectMetaIntoTemplate(template: string, metaTags: string): string {
  const withoutTitle = template.replace(/<title>[^<]*<\/title>/, "");
  const withoutDescription = withoutTitle.replace(
    /<meta\s+name="description"[^>]*\/?>/i,
    "",
  );
  return withoutDescription.replace("</head>", `${metaTags}\n</head>`);
}

export async function ogPropertyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { slug, propertyId } = req.params as {
    slug: string;
    propertyId: string;
  };

  try {
    const [property, profile] = await Promise.all([
      getPublicProperty(slug, propertyId),
      getStoredBusinessProfile(slug),
    ]);

    if (!property) {
      next();
      return;
    }

    const template = loadTemplate();
    if (!template) {
      next();
      return;
    }

    const businessName = profile?.businessName?.trim() || "Inmobiliaria";
    const operationLabel = property.operation === "sale" ? "Venta" : "Alquiler";
    const origin = getRequestOrigin(req);
    const canonicalUrl = `${origin}/${encodeURIComponent(slug)}/propiedades/${encodeURIComponent(propertyId)}`;

    const descriptionParts = [
      operationLabel,
      property.propertyType,
      property.location,
      property.price,
    ].filter(Boolean);
    const description = descriptionParts.join(" · ");

    const rawImage = property.images[0] ?? null;
    const imageUrl = rawImage
      ? resolveAbsoluteImageUrl(rawImage, origin)
      : null;

    const metaTags = buildOgMetaTags({
      title: property.title,
      businessName,
      description,
      canonicalUrl,
      imageUrl,
    });

    const html = injectMetaIntoTemplate(template, metaTags);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (error) {
    console.error("[OG] Error generating property Open Graph metadata:", error);
    next();
  }
}
