import { loadHtml2Pdf } from "@/lib/html2pdf";
import {
  type PropertyOperation,
  type PropertyStatus,
} from "@/lib/realEstateDemo";

type PdfProperty = {
  id: string;
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  price: string;
  location: string;
  address: string;
  propertyType: string;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  ageYears?: number | null;
  expenses?: string | null;
  coveredAreaM2?: number | null;
  uncoveredAreaM2?: number | null;
  areaM2?: number | null;
  disposition?: string | null;
  orientation?: string | null;
  detailedFeatures?: string[];
  features: string[];
  description: string;
  images: string[];
};

type PdfBusinessProfile = {
  slug?: string | null;
  businessName?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  primaryColor?: string | null;
};

// A4 dimensions and layout constants (mm)
const PW = 210;
const PH = 297;
const MG = 16;
const CW = PW - MG * 2; // 178mm

const PDF_TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bmas\b/gi, "más"],
  [/\bimagenes\b/gi, "imágenes"],
  [/\bdescripcion\b/gi, "descripción"],
  [/\bcaracteristicas\b/gi, "características"],
  [/\bbanos\b/gi, "baños"],
  [/\bbano\b/gi, "baño"],
  [/\bjardin\b/gi, "jardín"],
  [/\bdeposito\b/gi, "depósito"],
  [/\bgalpon\b/gi, "galpón"],
  [/\bbalcon\b/gi, "balcón"],
  [/\bmetalica\b/gi, "metálica"],
  [/\bmatricula\b/gi, "matrícula"],
  [/\binformacion\b/gi, "información"],
  [/\bcredito\b/gi, "crédito"],
  [/\bpublica\b/gi, "pública"],
  [/\bexposicion\b/gi, "exposición"],
  [/\bcirculacion\b/gi, "circulación"],
  [/\bcercania\b/gi, "cercanía"],
  [/\btransito\b/gi, "tránsito"],
  [/\brecepcion\b/gi, "recepción"],
  [/\bubicacion\b/gi, "ubicación"],
  [/\bestrategica\b/gi, "estratégica"],
  [/\bpractica\b/gi, "práctica"],
  [/\binversion\b/gi, "inversión"],
  [/\brio\b/gi, "río"],
  [/\bopcion\b/gi, "opción"],
  [/\bcomoda\b/gi, "cómoda"],
  [/\bdistribucion\b/gi, "distribución"],
  [/\bcaracter\b/gi, "carácter"],
];

function normalizePdfText(value: string) {
  return PDF_TEXT_REPLACEMENTS.reduce(
    (currentValue, [pattern, replacement]) => currentValue.replace(pattern, replacement),
    value,
  );
}

function formatAreaM2(value?: number | null) {
  return value != null ? `${value} m²` : null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatNumberDetail(value?: number | null) {
  return value != null ? String(value) : null;
}

function formatAgeDetail(value?: number | null) {
  if (value == null) return null;
  return value === 0 ? "A estrenar" : `${value} año${value === 1 ? "" : "s"}`;
}

function formatTextDetail(value?: string | null) {
  return value?.trim() || null;
}

function hasPdfDetailValue(item: { label: string; value: string | null }): item is {
  label: string;
  value: string;
} {
  return Boolean(item.value);
}

function buildPdfFilename(title: string) {
  const fileSlug =
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "propiedad";
  return `${fileSlug}.pdf`;
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);
}

// ── jsPDF low-level helpers ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = any;

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// 1 point → mm
function pt(points: number): number {
  return points / 2.835;
}

function pdfFill(doc: Doc, hex: string) {
  const [r, g, b] = hexRgb(hex);
  doc.setFillColor(r, g, b);
}

function pdfStroke(doc: Doc, hex: string, lw = 0.25) {
  const [r, g, b] = hexRgb(hex);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(lw);
}

function pdfColor(doc: Doc, hex: string) {
  const [r, g, b] = hexRgb(hex);
  doc.setTextColor(r, g, b);
}

function pdfRect(doc: Doc, x: number, y: number, w: number, h: number, fillHex: string) {
  pdfFill(doc, fillHex);
  doc.rect(x, y, w, h, "F");
}

function pdfHLine(doc: Doc, y: number, x1: number, x2: number, colorHex = "#ded8cc", lw = 0.25) {
  pdfStroke(doc, colorHex, lw);
  doc.line(x1, y, x2, y);
}

// Draw text with top baseline, return new Y after the block
function pdfText(
  doc: Doc,
  str: string,
  x: number,
  y: number,
  opts: {
    size: number;
    style?: "normal" | "bold" | "italic";
    color?: string;
    maxW?: number;
    lh?: number;
    align?: "left" | "right" | "center";
  },
): number {
  const { size, style = "normal", color = "#172124", maxW, lh = 1.45, align = "left" } = opts;
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
  pdfColor(doc, color);
  const lineH = pt(size) * lh;
  if (maxW) {
    const lines: string[] = doc.splitTextToSize(str, maxW);
    doc.text(lines, x, y, { baseline: "top", align });
    return y + lines.length * lineH;
  }
  doc.text(str, x, y, { baseline: "top", align });
  return y + lineH;
}

// ── Image helpers ──────────────────────────────────────────────────────────────

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function getImageSize(b64: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = b64;
  });
}

// Cover-crop an image to exact mm dimensions using a canvas at 150 dpi.
// Returns a JPEG data-URL with no white bands. Falls back to null on failure.
async function coverCropToBase64(
  b64: string,
  targetWmm: number,
  targetHmm: number,
): Promise<string | null> {
  const PX_PER_MM = 150 / 25.4;
  const pxW = Math.round(targetWmm * PX_PER_MM);
  const pxH = Math.round(targetHmm * PX_PER_MM);

  const size = await getImageSize(b64);
  if (size.w === 0 || size.h === 0) return null;

  const scale = Math.max(pxW / size.w, pxH / size.h);
  const dw = size.w * scale;
  const dh = size.h * scale;
  const ox = (pxW - dw) / 2;
  const oy = (pxH - dh) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = pxW;
  canvas.height = pxH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const img = new Image();
  return new Promise<string | null>((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, ox, oy, dw, dh);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => resolve(null);
    img.src = b64;
  });
}

// Draw image contained (no crop) in a rect, warm background behind
async function pdfContainImage(
  doc: Doc,
  b64: string,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  pdfRect(doc, rx, ry, rw, rh, "#f7f5ef");
  const size = await getImageSize(b64);
  if (size.w === 0 || size.h === 0) return;
  const scale = Math.min(rw / size.w, rh / size.h);
  const dw = size.w * scale;
  const dh = size.h * scale;
  const dx = rx + (rw - dw) / 2;
  const dy = ry + (rh - dh) / 2;
  const fmt = b64.startsWith("data:image/png") ? "PNG" : "JPEG";
  doc.addImage(b64, fmt, dx, dy, dw, dh);
}

// ── Vector PDF builder ─────────────────────────────────────────────────────────

async function buildVectorPdf(
  property: PdfProperty,
  profile: PdfBusinessProfile,
  publicPropertyUrl: string,
): Promise<Blob> {
  // jsPDF is bundled inside html2pdf.bundle.min.js; loadHtml2Pdf() must be called first.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jspdfMod = (window as any).jspdf as
    | { jsPDF: new (opts: Record<string, unknown>) => Doc }
    | undefined;
  if (!jspdfMod?.jsPDF) {
    throw new Error("jsPDF no está disponible. Recargá la página e intentá de nuevo.");
  }
  const doc: Doc = new jspdfMod.jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // ── Preload images ───────────────────────────────────────────────────────────
  const heroUrl = property.images[0] ?? null;
  const galleryUrls = property.images.slice(1, 4);
  const logoUrl = profile.logoUrl?.trim() || null;

  const [heroB64, logoB64, ...galleryRaw] = await Promise.all([
    heroUrl ? loadImageAsBase64(heroUrl) : Promise.resolve(null),
    logoUrl ? loadImageAsBase64(logoUrl) : Promise.resolve(null),
    ...galleryUrls.map((u) => loadImageAsBase64(u)),
  ]);
  const galleryB64s = galleryRaw.filter((b): b is string => b !== null);

  // ── Business data ────────────────────────────────────────────────────────────
  const businessName = profile.businessName?.trim() || "Inmobiliaria";
  const wa = profile.whatsapp?.trim() || profile.phone?.trim() || null;
  const email = profile.email?.trim() || null;
  const profileAddress = profile.address?.trim() || null;

  // ── Quick data ───────────────────────────────────────────────────────────────
  const quickData: Array<{ label: string; value: string }> = [];
  const area = property.areaM2 ?? property.coveredAreaM2;
  if (area) quickData.push({ label: "Superficie", value: `${area} m²` });
  if (property.bedrooms && property.bedrooms > 0) {
    quickData.push({
      label: property.bedrooms === 1 ? "Dormitorio" : "Dormitorios",
      value: String(property.bedrooms),
    });
  } else if (property.rooms && property.rooms > 0) {
    quickData.push({
      label: property.rooms === 1 ? "Ambiente" : "Ambientes",
      value: String(property.rooms),
    });
  }
  if (property.bathrooms && property.bathrooms > 0) {
    quickData.push({
      label: property.bathrooms === 1 ? "Baño" : "Baños",
      value: String(property.bathrooms),
    });
  }
  if (quickData.length < 4 && property.garages && property.garages > 0) {
    quickData.push({
      label: property.garages === 1 ? "Cochera" : "Cocheras",
      value: String(property.garages),
    });
  }

  // ── Characteristics ──────────────────────────────────────────────────────────
  const propertyDetails = [
    { label: "Tipo", value: normalizePdfText(property.propertyType) },
    {
      label: "Ambientes",
      value: property.rooms && property.rooms > 0 ? String(property.rooms) : null,
    },
    {
      label: "Dormitorios",
      value: property.bedrooms && property.bedrooms > 0 ? String(property.bedrooms) : null,
    },
    {
      label: "Baños",
      value: property.bathrooms && property.bathrooms > 0 ? String(property.bathrooms) : null,
    },
    {
      label: "Cocheras",
      value: property.garages && property.garages > 0 ? String(property.garages) : null,
    },
    { label: "Antigüedad", value: formatAgeDetail(property.ageYears) },
    { label: "Expensas", value: formatTextDetail(property.expenses) },
    { label: "Sup. cubierta", value: formatAreaM2(property.coveredAreaM2) },
    { label: "Sup. descubierta", value: formatAreaM2(property.uncoveredAreaM2) },
    { label: "Sup. total", value: formatAreaM2(property.areaM2) },
    { label: "Disposición", value: formatTextDetail(property.disposition) },
    { label: "Orientación", value: formatTextDetail(property.orientation) },
  ].filter(hasPdfDetailValue);

  const summaryFeatures = [...property.features, ...(property.detailedFeatures ?? [])];

  // Full description shown once, on page 2 only
  const fullDesc = property.description ? normalizePdfText(property.description).trim() : "";

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════════════════════════
  let y = MG;

  // Header ─────────────────────────────────────────────────────────────────────
  const HEADER_H = 18;

  if (logoB64) {
    const logoSize = await getImageSize(logoB64);
    const lh = 12;
    const lw = logoSize.h > 0 ? Math.min(lh * (logoSize.w / logoSize.h), 55) : 40;
    const lfmt = logoB64.startsWith("data:image/png") ? "PNG" : "JPEG";
    doc.addImage(logoB64, lfmt, MG, y + (HEADER_H - lh) / 2, lw, lh);
  } else {
    pdfText(doc, businessName, MG, y + 3, { size: 13, style: "bold" });
  }

  pdfText(doc, "FICHA COMERCIAL DE PROPIEDAD", PW - MG, y + 3, {
    size: 6.5,
    style: "bold",
    color: "#465153",
    align: "right",
  });
  let contactY = y + 3 + pt(6.5) * 1.5 + 1.5;
  if (wa) {
    contactY = pdfText(doc, wa, PW - MG, contactY, {
      size: 7.5,
      color: "#465153",
      align: "right",
    });
  }
  if (email) {
    pdfText(doc, email, PW - MG, contactY, {
      size: 7.5,
      color: "#465153",
      align: "right",
    });
  }

  y += HEADER_H;
  pdfHLine(doc, y, MG, PW - MG, "#ded8cc", 0.35);
  y += 3;

  // Hero — cover crop: fills the frame, no bands, no deformation
  const HERO_H = 88;
  if (heroB64) {
    const heroJpeg = await coverCropToBase64(heroB64, CW, HERO_H);
    if (heroJpeg) {
      doc.addImage(heroJpeg, "JPEG", MG, y, CW, HERO_H);
    } else {
      await pdfContainImage(doc, heroB64, MG, y, CW, HERO_H);
    }
  } else {
    pdfRect(doc, MG, y, CW, HERO_H, "#f7f5ef");
    pdfText(doc, property.title, MG + CW / 2, y + HERO_H / 2 - pt(13), {
      size: 13,
      style: "bold",
      color: "#465153",
      align: "center",
    });
  }
  y += HERO_H + 5;

  // Editorial ──────────────────────────────────────────────────────────────────
  const LEFT_W = CW * 0.59;
  const PRICE_W = CW * 0.37;
  const PRICE_X = PW - MG - PRICE_W;

  const eyebrowParts = [property.propertyType, property.location].filter(Boolean);
  if (eyebrowParts.length > 0) {
    pdfText(doc, eyebrowParts.join(" · ").toUpperCase(), MG, y, {
      size: 7,
      style: "bold",
      color: "#465153",
    });
    y += pt(7) * 1.5 + 1;
  }

  // Title (left)
  const titleTopY = y;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  pdfColor(doc, "#172124");
  const titleLines: string[] = doc.splitTextToSize(property.title, LEFT_W);
  doc.text(titleLines, MG, titleTopY, { baseline: "top" });
  const titleBlockH = titleLines.length * pt(20) * 1.2;

  // Price block (right, aligned to title top)
  let priceBlockH = 0;
  if (property.price) {
    const priceLabel =
      property.operation === "sale" ? "PRECIO DE VENTA" : "PRECIO DE ALQUILER";
    pdfText(doc, priceLabel, PRICE_X + PRICE_W / 2, titleTopY, {
      size: 6.5,
      style: "bold",
      color: "#465153",
      align: "center",
    });
    const priceLabelH = pt(6.5) * 1.5;
    const priceRectY = titleTopY + priceLabelH + 1;
    const PRICE_RECT_H = pt(13) * 1.9;
    pdfRect(doc, PRICE_X, priceRectY, PRICE_W, PRICE_RECT_H, "#12383d");
    // Vertically center the price text in the rect
    const priceTextY = priceRectY + (PRICE_RECT_H - pt(13)) / 2;
    pdfText(doc, property.price, PRICE_X + PRICE_W / 2, priceTextY, {
      size: 13,
      style: "bold",
      color: "#ffffff",
      align: "center",
    });
    priceBlockH = priceLabelH + 1 + PRICE_RECT_H;
  }

  y += Math.max(titleBlockH, priceBlockH) + 4;

  // Location
  const locParts = [property.address, property.location].filter(Boolean);
  if (locParts.length > 0) {
    y = pdfText(doc, locParts.join(" — "), MG, y, {
      size: 8,
      color: "#465153",
      maxW: CW,
    });
    y += 3;
  }

  // Quick data row ─────────────────────────────────────────────────────────────
  if (quickData.length > 0) {
    const cols = Math.min(quickData.length, 4);
    const cellW = CW / cols;
    const QH = 18;
    pdfRect(doc, MG, y, CW, QH, "#f7f5ef");
    pdfStroke(doc, "#ded8cc", 0.25);
    doc.rect(MG, y, CW, QH);

    quickData.slice(0, 4).forEach((d, i) => {
      if (i > 0) {
        pdfStroke(doc, "#ded8cc", 0.2);
        doc.line(MG + i * cellW, y, MG + i * cellW, y + QH);
      }
      const cx = MG + i * cellW + cellW / 2;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      pdfColor(doc, "#172124");
      doc.text(d.value, cx, y + 3, { baseline: "top", align: "center" });
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      pdfColor(doc, "#465153");
      doc.text(d.label.toUpperCase(), cx, y + 3 + pt(13) * 1.3, {
        baseline: "top",
        align: "center",
      });
    });
    y += QH + 5;
  }

  // Footer page 1 ──────────────────────────────────────────────────────────────
  const f1Y = PH - MG - pt(7.5) * 1.45;
  pdfHLine(doc, f1Y - 2, MG, PW - MG, "#ded8cc", 0.2);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  pdfColor(doc, "#172124");
  doc.text(businessName, MG, f1Y, { baseline: "top" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  pdfColor(doc, "#465153");
  doc.text("Tienda Link Inmobiliarias", PW - MG, f1Y, { baseline: "top", align: "right" });

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2
  // ════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = MG;

  // Mini header ────────────────────────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  pdfColor(doc, "#172124");
  doc.text(businessName, MG, y, { baseline: "top" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  pdfColor(doc, "#465153");
  doc.text("FICHA COMERCIAL DE PROPIEDAD", PW - MG, y, { baseline: "top", align: "right" });
  y += pt(11) * 1.4;
  pdfHLine(doc, y, MG, PW - MG, "#ded8cc", 0.3);
  y += 4;

  // Full description — one paragraph at a time so jsPDF respects real \n breaks.
  // splitTextToSize ignores \n; we split manually and render each paragraph separately.
  if (fullDesc) {
    if (y + 20 > PH - MG - 12) {
      doc.addPage();
      y = MG;
    }
    pdfText(doc, "DESCRIPCIÓN", MG, y, { size: 7, style: "bold", color: "#465153" });
    y += pt(7) * 1.5 + 2;

    const DESC_SIZE = 9;
    const DESC_LH = 1.55;
    const PARA_GAP = pt(DESC_SIZE) * 0.75;

    const paragraphs = fullDesc.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 0);
    paragraphs.forEach((para, idx) => {
      doc.setFontSize(DESC_SIZE);
      doc.setFont("helvetica", "normal");
      const lines: string[] = doc.splitTextToSize(para, CW);
      const paraH = lines.length * pt(DESC_SIZE) * DESC_LH;
      if (y + paraH > PH - MG - 12) {
        doc.addPage();
        y = MG;
      }
      y = pdfText(doc, para, MG, y, {
        size: DESC_SIZE,
        color: "#172124",
        maxW: CW,
        lh: DESC_LH,
      });
      if (idx < paragraphs.length - 1) {
        y += PARA_GAP;
      }
    });
    y += 6;
  }

  // Characteristics table ──────────────────────────────────────────────────────
  if (propertyDetails.length > 0) {
    if (y + 30 > PH - MG - 12) {
      doc.addPage();
      y = MG;
    }
    pdfText(doc, "CARACTERÍSTICAS", MG, y, { size: 7, style: "bold", color: "#465153" });
    y += pt(7) * 1.5 + 2;

    const COL_W = (CW - 3) / 2;
    const RH = pt(8) * 1.8 + 2;

    propertyDetails.forEach((detail, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = MG + col * (COL_W + 3);
      const ry = y + row * RH;

      if (row % 2 === 0) {
        pdfRect(doc, cx, ry, COL_W, RH, "#f7f5ef");
      }
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      pdfColor(doc, "#465153");
      doc.text(detail.label, cx + 3, ry + 2, { baseline: "top" });
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      pdfColor(doc, "#172124");
      doc.text(normalizePdfText(detail.value), cx + COL_W - 3, ry + 2, {
        baseline: "top",
        align: "right",
      });
      pdfHLine(doc, ry + RH, cx, cx + COL_W, "#ded8cc", 0.15);
    });

    y += Math.ceil(propertyDetails.length / 2) * RH + 6;
  }

  // Feature pills ──────────────────────────────────────────────────────────────
  if (summaryFeatures.length > 0) {
    if (y + 20 > PH - MG - 12) {
      doc.addPage();
      y = MG;
    }
    pdfText(doc, "CARACTERÍSTICAS ADICIONALES", MG, y, {
      size: 7,
      style: "bold",
      color: "#465153",
    });
    y += pt(7) * 1.5 + 2;

    const PILL_TS = 6.5;
    const PILL_PH = 2.5; // horizontal padding
    const PILL_PV = 2; // vertical padding
    const PILL_H = pt(PILL_TS) * 1.45 + PILL_PV * 2;
    const PILL_GAP = 2.5;
    let tagX = MG;

    summaryFeatures.forEach((feat) => {
      const label = normalizePdfText(feat).toUpperCase();
      doc.setFontSize(PILL_TS);
      doc.setFont("helvetica", "normal");
      const tw = doc.getTextWidth(label);
      const pw = tw + PILL_PH * 2;

      if (tagX + pw > PW - MG) {
        y += PILL_H + PILL_GAP;
        tagX = MG;
      }

      pdfFill(doc, "#f7f5ef");
      pdfStroke(doc, "#ded8cc", 0.2);
      doc.rect(tagX, y, pw, PILL_H, "FD");
      pdfColor(doc, "#465153");
      doc.text(label, tagX + PILL_PH, y + PILL_PV, { baseline: "top" });
      tagX += pw + PILL_GAP;
    });
    y += PILL_H + 6;
  }

  // Gallery ────────────────────────────────────────────────────────────────────
  if (galleryB64s.length > 0) {
    if (y + 50 > PH - MG - 12) {
      doc.addPage();
      y = MG;
    }
    pdfText(doc, "IMÁGENES ADICIONALES", MG, y, {
      size: 7,
      style: "bold",
      color: "#465153",
    });
    y += pt(7) * 1.5 + 2;

    const count = Math.min(galleryB64s.length, 3);
    const GAP = 3;
    const imgW = (CW - GAP * (count - 1)) / count;
    const imgH = 42;

    for (let i = 0; i < count; i++) {
      const b64 = galleryB64s[i];
      const ix = MG + i * (imgW + GAP);
      await pdfContainImage(doc, b64, ix, y, imgW, imgH);
    }
    y += imgH + 6;
  }

  // Contact block ──────────────────────────────────────────────────────────────
  const contactLines: string[] = [];
  if (wa) contactLines.push(wa);
  if (email) contactLines.push(email);
  if (profileAddress) contactLines.push(profileAddress);

  if (contactLines.length > 0 || publicPropertyUrl) {
    const CPAD = 7;
    const lineCount = contactLines.length + (publicPropertyUrl ? 1 : 0);
    const CH = CPAD + lineCount * pt(8.5) * 1.6 + CPAD;
    if (y + CH > PH - MG - 12) {
      doc.addPage();
      y = MG;
    }

    pdfRect(doc, MG, y, CW, CH, "#12383d");
    let cy = y + CPAD;
    contactLines.forEach((line) => {
      cy = pdfText(doc, line, MG + 8, cy, { size: 8.5, color: "#ffffff" });
    });
    if (publicPropertyUrl) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      pdfColor(doc, "#9ecfd3");
      doc.text(publicPropertyUrl, MG + 8, cy, { baseline: "top" });
      const urlW = doc.getTextWidth(publicPropertyUrl);
      doc.link(MG + 8, cy, urlW, pt(8) * 1.45, { url: publicPropertyUrl });
    }
    y += CH + 5;
  }

  // Footer page 2 ──────────────────────────────────────────────────────────────
  const f2Y = PH - MG - pt(7.5) * 1.45;
  pdfHLine(doc, f2Y - 2, MG, PW - MG, "#ded8cc", 0.2);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  pdfColor(doc, "#172124");
  doc.text(businessName, MG, f2Y, { baseline: "top" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  pdfColor(doc, "#465153");
  doc.text("Tienda Link Inmobiliarias", PW - MG, f2Y, { baseline: "top", align: "right" });

  return doc.output("blob") as Blob;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function generatePropertyPdf({
  property,
  profile,
}: {
  property: PdfProperty;
  profile: PdfBusinessProfile;
}): Promise<void> {
  const slug = profile.slug?.trim() || "";
  const publicPropertyUrl =
    typeof window !== "undefined" && slug
      ? `${window.location.origin}/${slug}/propiedades/${property.id}`
      : "";

  // Load the CDN bundle (html2pdf.bundle.min.js also exposes window.jspdf.jsPDF)
  await loadHtml2Pdf();

  const filename = buildPdfFilename(property.title);
  const blob = await buildVectorPdf(property, profile, publicPropertyUrl);

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("El PDF no se pudo generar correctamente.");
  }

  triggerDownload(blob, filename);
}
